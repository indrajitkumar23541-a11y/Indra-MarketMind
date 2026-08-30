import requests
import time
import json

url = "http://localhost:8002/analyze/ensemble"
payload = {
    "text": "Reliance Industries reports record breaking Q3 profits, announces stock split and huge dividend. Analysts see strong growth.",
    "ticker": "RELIANCE.NS"
}

# Wait for server to be up
print("Waiting for server to load models...")
for i in range(30):
    try:
        health = requests.get("http://localhost:8002/health")
        if health.status_code == 200:
            print("Server is UP!")
            break
    except:
        time.sleep(2)

print("\nTesting Ensemble Endpoint:")
start_time = time.time()
response = requests.post(url, json=payload)
end_time = time.time()

if response.status_code == 200:
    data = response.json()
    print(f"Time taken: {end_time - start_time:.2f} seconds")
    print("\n--- ENSEMBLE RESULTS ---")
    print(f"Final Score : {data['ensemble_score']:.3f}")
    print(f"Signal      : {data['signal']}")
    print("\n--- INDIVIDUAL MODELS ---")
    for model, res in data['models_breakdown'].items():
        score = res.get('score', res.get('polarity', 0.0))
        label = res.get('label', 'Neutral')
        print(f"{model.upper():<10}: {score:+.3f} ({label})")
    
    print("\n--- ACTIVE WEIGHTS ---")
    for model, weight in data['active_weights'].items():
        print(f"{model.upper():<10}: {weight*100:.1f}%")
else:
    print(f"Error {response.status_code}: {response.text}")
