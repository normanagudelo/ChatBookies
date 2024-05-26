from flask import Flask, render_template,jsonify,request
from PyPDF2 import PdfReader
import requests
import json
from flask import jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)  # Configurar CORS para permitir todas las solicitudes desde cualquier origen

query=""

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/upload', methods=['POST'])  # Configurar CORS para permitir todas las solicitudes desde cualquier origen
def upload():
    
    if 'filePDF' not in request.files: 
        query = request.form.get('query', '')
        textoGenerado = ConsultaIA(query)        
        print(textoGenerado)

    else: 
        query = request.form.get('query', '')
        file = request.files['filePDF']
        texto = convert_pdf_to_text(file)
        texto ="\""+texto+"\""
        query=query+":"+texto
        textoGenerado = ConsultaIA(query)
        print(textoGenerado)
        
    return jsonify({'textoGenerado': textoGenerado})
    
def convert_pdf_to_text(file):
    texto = ''

    if file:   
        pdf_reader = PdfReader(file)
        for page_num in range(len(pdf_reader.pages)):
            page = pdf_reader.pages[page_num]
            texto += page.extract_text()
        return texto

    else: 
        return texto

def ConsultaIA(texto, idioma='es'):

    data = {"contents":[{"parts":[{"text":texto}]}]}
    print("data:")
    print(data)
    url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=AIzaSyBjrkr-pC3Ry0PjbbZyOzQyOIFy1qwVjNU"

    headers = {
    'Content-Type': 'application/json',
    }

    response = requests.post(url, headers=headers, data=json.dumps(data))
    print("response:")
    print(response)

    if response.status_code == 200:
        result = response.json()
        try:
            generated_text = result['candidates'][0]['content']['parts'][0]['text']
            return generated_text

        except KeyError:
            print("Falla general durante la consulta.")
    else:
        print(f"Error en la solicitud: {response.status_code} - {response.text}")
        return None

if __name__ == '__main__':
    app.run(host='127.0.0.1', port=5000, debug=True)

