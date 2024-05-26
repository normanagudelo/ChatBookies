       // Opciones de la solicitud Fetch para configurar los encabezados CORS

       const pdfViewer = document.getElementById('pdf-viewer');
       const pdfDropzone = document.getElementById('pdf-dropzone');
       var formDatafileQuery = new FormData();
       var formDataQuery = new FormData();
       var query = "";
       var file;
       sessionStorage.setItem('historia', '');

       pdfDropzone.addEventListener('dragover', function (e) {
           e.preventDefault();
           pdfDropzone.classList.add('dragover');
       });

       pdfDropzone.addEventListener('dragleave', function () {
           pdfDropzone.classList.remove('dragover');
       });

       pdfDropzone.addEventListener('drop', function (e) {
           e.preventDefault();
           pdfDropzone.classList.remove('dragover');

           file = e.dataTransfer.files[0];

           if (file.type === 'application/pdf') {

               formDatafileQuery.append('filePDF', file);

               const reader = new FileReader();
               reader.onload = function (event) {
                   const pdfData = event.target.result;
                   const pdfObject = '<embed width="100%" height="100%" src="' + pdfData + '" type="application/pdf">';
                   pdfViewer.innerHTML = pdfObject;
               };
               reader.readAsDataURL(file);

           } else {
               alert('Por favor, selecciona un archivo PDF.');
           }
       });

       function submitForm() {

           var textoGenerado = "";
           query = "";
           var conversacion = "";
           var resultado = document.getElementById('textoGeneradoArea');
           resultado.innerHTML = "";
           query = document.querySelector('input[name="query"]').value;
           conversacion = sessionStorage.getItem('historia');
           console.log("estoy en submit()");

           if (file && query) {
               console.log(query);
               formDatafileQuery.append('query', query);
               formDatafileQuery.append('filePDF', file);
               console.log("estoy en if (file&&query){)");
           }
           else if (!file && query) {
               console.log(query+" -->> esto es el query");
               formDataQuery.append('query', query);
               console.log("Estoy en else if (!file&&query)")
           }
           else {
               alert('Debes ingresar una consulta');
           }
           if (file && query) {
               fetch('http://127.0.0.1:5000/upload', {
                   method: 'POST',
                   body: formDatafileQuery
               })
                   .then(response => response.text())
                   .then(data => {
                       console.log("estoy en else if (file&&query) del fetch")
                       var jsonData = JSON.parse(data);
                       textoGenerado = jsonData.textoGenerado;
                       console.log(textoGenerado);
                       textoGeneradoConvertido = convertirTexto(textoGenerado)
                       const resultado = document.getElementById('textoGeneradoArea');
                       resultado.innerHTML = textoGeneradoConvertido;
                   })
                   .catch(error => {
                       console.error('Error:', error);
                   });

           }
           else if (!file && query) {
               fetch('http://127.0.0.1:5000/upload', {
                   method: 'POST',
                   body: formDataQuery
               })
                   .then(response => response.text())
                   .then(data => {
                       console.log("estoy en else if (!file&&query) del fetch")
                       const jsonData = JSON.parse(data);
                       textoGenerado = jsonData.textoGenerado;
                        console.log(textoGenerado+"<<<Textogenerado")
                       
                       if (textoGenerado.includes("@startuml")) {
                        content=extractContentUML(textoGenerado);
                        console.log(content+"<------content");
                        const plantumlSource = `@startuml`+content+`@enduml`;
                        console.log(plantumlSource+"<------plantumlSource");
                        const encodedDiagram = plantumlEncoder.encode(plantumlSource);
                        
                        const img = document.createElement('img');
                        img.src = 'data:image/png;base64,' + encodedDiagram;
                        // Reemplazar la línea donde asignabas resultado.innerHTML
                        // con la asignación del elemento <img>
                        const resultado = document.getElementById('textoGeneradoArea');
                        resultado.innerHTML = ''; // Limpiar cualquier contenido anterior
                        resultado.appendChild(img); // Agregar la imagen al resultado

                       
                      } else {
                        console.log(textoGenerado);
                       textoGeneradoConvertido = convertirTexto(textoGenerado)
                       resultado.innerHTML = textoGeneradoConvertido;
                       console.log(conversacion)
                       conversacion = conversacion + '<usuario>:' + query;
                       conversacion = conversacion + '<Gemini>:' + textoGenerado;
                       sessionStorage.setItem('historia', conversacion);
                      }

                   })
                   .catch(error => {
                       console.error('Error:', error);
                       console.log('No puedo responder por falla en la estructura de la consulta');
                       resultado.innerHTML = 'No puedo responder por falla en la estructura de la consulta';
                   })
           }
           limpiarFormularios();
       }

       function convertirTexto(cadena) {
           // Reemplaza '**' con '<h4>' y '</h4>' alternativamente
           let contador = 0;
           cadena = cadena.replace(/\*\*/g, function (match) {
               contador++;
               return contador % 2 === 1 ? '<h2>' : '</h2>';
           });
           return cadena;
       }

       function limpiarFormularios() {
           formDatafileQuery = new FormData(); // Limpiar formDatafileQuery
           formDataQuery = new FormData(); // Limpiar formDataQuery
       }

       function extractContentUML(inputString) {
        // Definir los marcadores de inicio y fin
        const startMarker = "@startuml";
        const endMarker = "@enduml";
      
        // Encontrar las posiciones de los marcadores
        const startIndex = inputString.indexOf(startMarker);
        const endIndex = inputString.indexOf(endMarker);
      
        // Validar la existencia de los marcadores
        if (startIndex === -1 || endIndex === -1 || endIndex < startIndex) {
          throw new Error("Los marcadores UML no se encontraron o están mal ubicados.");
        }
      
        // Extraer el contenido UML
        const content = inputString.substring(startIndex + startMarker.length, endIndex);
      
        return content;
      }
