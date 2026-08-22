import torch
import torch.nn as nn
import pandas as pd
import numpy as np
from sklearn.preprocessing import MinMaxScaler
from typing import Dict, Any, Tuple
import logging

logger = logging.getLogger("forecasting.lstm")

class StockLSTM(nn.Module):
    def __init__(self, input_dim, hidden_dim, num_layers, output_dim, dropout=0.2):
        super(StockLSTM, self).__init__()
        self.hidden_dim = hidden_dim
        self.num_layers = num_layers
        
        self.lstm = nn.LSTM(input_dim, hidden_dim, num_layers, batch_first=True, dropout=dropout if num_layers > 1 else 0)
        self.fc = nn.Linear(hidden_dim, output_dim)
        
    def forward(self, x):
        # Initialize hidden state with zeros
        h0 = torch.zeros(self.num_layers, x.size(0), self.hidden_dim).requires_grad_()
        c0 = torch.zeros(self.num_layers, x.size(0), self.hidden_dim).requires_grad_()
        
        # We need to detach as we are doing truncated backpropagation through time (BPTT)
        out, (hn, cn) = self.lstm(x, (h0.detach(), c0.detach()))
        
        # Decode the hidden state of the last time step
        out = self.fc(out[:, -1, :]) 
        return out

class LSTMForecaster:
    """
    LSTM model to predict short-term stock price residuals using technicals and sentiment.
    """
    def __init__(self, sequence_length=14, hidden_dim=32, num_layers=2, learning_rate=0.005, epochs=100):
        self.sequence_length = sequence_length
        self.hidden_dim = hidden_dim
        self.num_layers = num_layers
        self.learning_rate = learning_rate
        self.epochs = epochs
        
        self.model = None
        self.scaler_X = MinMaxScaler(feature_range=(-1, 1))
        self.scaler_y = MinMaxScaler(feature_range=(-1, 1))
        self.feature_columns = []
        
    def create_sequences(self, data: np.ndarray, targets: np.ndarray) -> Tuple[torch.Tensor, torch.Tensor]:
        xs, ys = [], []
        for i in range(len(data) - self.sequence_length):
            x = data[i:(i + self.sequence_length)]
            y = targets[i + self.sequence_length]
            xs.append(x)
            ys.append(y)
        return torch.tensor(np.array(xs), dtype=torch.float32), torch.tensor(np.array(ys), dtype=torch.float32)
        
    def train(self, df: pd.DataFrame, feature_cols: list, target_col: str):
        """
        Trains the LSTM model.
        """
        if df.empty or len(df) < self.sequence_length + 10:
            raise ValueError("Not enough data to train LSTM")
            
        self.feature_columns = feature_cols
        
        # Scale features and target
        X = self.scaler_X.fit_transform(df[feature_cols].values)
        y = self.scaler_y.fit_transform(df[[target_col]].values)
        
        X_seq, y_seq = self.create_sequences(X, y)
        
        input_dim = len(feature_cols)
        self.model = StockLSTM(input_dim=input_dim, hidden_dim=self.hidden_dim, 
                               num_layers=self.num_layers, output_dim=1)
                               
        criterion = nn.MSELoss()
        optimizer = torch.optim.Adam(self.model.parameters(), lr=self.learning_rate)
        
        self.model.train()
        for epoch in range(self.epochs):
            optimizer.zero_grad()
            outputs = self.model(X_seq)
            loss = criterion(outputs, y_seq)
            loss.backward()
            optimizer.step()
            
            if (epoch+1) % 20 == 0:
                logger.debug(f"Epoch {epoch+1}/{self.epochs}, Loss: {loss.item():.4f}")
                
        logger.info("LSTM model trained successfully.")
        
    def predict_next(self, df: pd.DataFrame) -> float:
        """
        Predicts the very next step based on the most recent sequence.
        """
        if self.model is None:
            raise RuntimeError("Model must be trained before predicting")
            
        self.model.eval()
        
        # Get the last sequence_length days
        recent_data = df[self.feature_columns].tail(self.sequence_length).values
        scaled_recent = self.scaler_X.transform(recent_data)
        
        # Shape: (1, seq_length, num_features)
        x_tensor = torch.tensor(scaled_recent, dtype=torch.float32).unsqueeze(0)
        
        with torch.no_grad():
            pred_scaled = self.model(x_tensor)
            
        pred_value = self.scaler_y.inverse_transform(pred_scaled.numpy())[0][0]
        return float(pred_value)
