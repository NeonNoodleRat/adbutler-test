from flask import Flask, request, send_from_directory

app = Flask(__name__)

@app.route('/')
def home():
    # Serve the portal.html file when accessing the root URL
    return send_from_directory('.', 'portal.html')

@app.route('/log', methods=['POST'])
def log():
    data = request.get_json()
    if data and 'log' in data:
        print(data['log'])  # Log the message to the terminal
        return 'Logged', 200
    return 'Bad Request', 400

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8000)
