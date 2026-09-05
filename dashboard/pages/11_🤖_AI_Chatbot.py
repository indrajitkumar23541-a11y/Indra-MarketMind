import streamlit as st
import requests

# Set page config
st.set_page_config(
    page_title="Indra-MarketMind | AI Chatbot",
    page_icon="🤖",
    layout="wide"
)

st.title("🤖 Indra-MarketMind AI Chatbot")
st.markdown("Ask anything about market sentiment, stock trends, or news. Powered by **Groq** and **PGVector**.")

# Chatbot endpoint URL (using the docker container name if running in docker, else localhost for dev)
CHATBOT_API_URL = "http://rag-chatbot:8006/chat"

# Initialize chat history in session state
if "messages" not in st.session_state:
    st.session_state.messages = []

# Display chat messages from history on app rerun
for message in st.session_state.messages:
    with st.chat_message(message["role"]):
        st.markdown(message["content"])

# React to user input
if prompt := st.chat_input("Ask about market sentiment..."):
    # Display user message in chat message container
    st.chat_message("user").markdown(prompt)
    
    # Add user message to chat history
    st.session_state.messages.append({"role": "user", "content": prompt})

    # Show a loading spinner while waiting for response
    with st.spinner("Thinking..."):
        try:
            # Send request to RAG Chatbot Microservice
            response = requests.post(CHATBOT_API_URL, json={"query": prompt})
            
            if response.status_code == 200:
                answer = response.json().get("answer", "No answer received.")
            else:
                answer = f"Error: The backend returned status code {response.status_code}."
                
        except requests.exceptions.ConnectionError:
            answer = "Error: Could not connect to the RAG Chatbot service. Make sure the container is running."
            
    # Display assistant response in chat message container
    with st.chat_message("assistant"):
        st.markdown(answer)
        
    # Add assistant response to chat history
    st.session_state.messages.append({"role": "assistant", "content": answer})
