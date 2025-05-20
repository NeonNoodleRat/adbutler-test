from flask import Flask, request, send_from_directory

app = Flask(__name__)

@app.route('/')
def home():
    # Serve the login.html file when accessing the root URL
    return send_from_directory('.', 'login.html')

@app.route('/portal.html')
def portal():
    # Serve the portal.html file when redirected
    return send_from_directory('.', 'portal.html')

@app.route('/bill-create.html')
def bill_create():
    # Serve the bill-create.html file when redirected
    return send_from_directory('.', 'bill-create.html')

@app.route('/log', methods=['POST'])
def log():
    data = request.get_json()
    if data and 'log' in data:
        print(data['log'])  # Log the message to the terminal
        return 'Logged', 200
    return 'Bad Request', 400

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8000)
