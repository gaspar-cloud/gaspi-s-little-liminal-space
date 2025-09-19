// ====== VARIABLES GLOBALES ======
let esAdmin = false;

// ====== FUNCIONES EXISTENTES ======

// Función para el botón de saludo
function saludar() {
  alert("felipe was here,");
}

// Función para agregar texto al blog
function agregarTexto() {
  if (!esAdmin) {
    alert("Solo el administrador puede agregar entradas.");
    return;
  }
  
  const input = document.getElementById("nuevo-texto");
  const texto = input.value.trim();
  
  if (texto === "") {
    alert("¡Por favor escribe algo!");
    return;
  }
  
  const div = document.getElementById("blog");
  const contenedor = document.createElement("div");
  contenedor.className = "entrada-blog";
  
  const p = document.createElement("p");
  p.textContent = texto;
  
  const botonBorrar = document.createElement("button");
  botonBorrar.textContent = "X";
  botonBorrar.className = "borrar-entrada";
  botonBorrar.onclick = function() {
    if (confirm("¿Borrar esta entrada?")) {
      contenedor.remove();
      guardarEnStorage();
    }
  };
  
  contenedor.appendChild(p);
  contenedor.appendChild(botonBorrar);
  div.appendChild(contenedor);

  guardarEnStorage();
  input.value = "";
  input.focus();
}

// Función para guardar en localStorage
function guardarEnStorage() {
  const entradas = [];
  const elementos = document.querySelectorAll('#blog .entrada-blog p');
  elementos.forEach(function(elemento) {
    entradas.push(elemento.textContent);
  });
  localStorage.setItem("blogEntradas", JSON.stringify(entradas));
}

// Función para cargar contenido
function cargarContenido() {
  const div = document.getElementById("blog");
  if (localStorage.getItem("blogEntradas")) {
    const entradas = JSON.parse(localStorage.getItem("blogEntradas"));
    entradas.forEach(function(texto) {
      const contenedor = document.createElement("div");
      contenedor.className = "entrada-blog";
      
      const p = document.createElement("p");
      p.textContent = texto;
      
      const botonBorrar = document.createElement("button");
      botonBorrar.textContent = "X";
      botonBorrar.className = "borrar-entrada";
      botonBorrar.onclick = function() {
        if (confirm("¿Borrar esta entrada?")) {
          contenedor.remove();
          guardarEnStorage();
        }
      };
      
      contenedor.appendChild(p);
      contenedor.appendChild(botonBorrar);
      div.appendChild(contenedor);
    });
  }
}

// Contador de visitas
function actualizarContador() {
  let contador = localStorage.getItem("visitas") || 0;
  contador = parseInt(contador) + 1;
  localStorage.setItem("visitas", contador);
  document.getElementById("contador").textContent = contador;
}

// Función para borrar todo el contenido
function borrarTodo() {
  const div = document.getElementById("blog");
  if (div.children.length === 0) {
    alert("No hay nada que borrar");
    return;
  }
  
  if (confirm("¿Estás seguro de que quieres borrar TODO el contenido?")) {
    div.innerHTML = "";
    localStorage.setItem("blogEntradas", JSON.stringify([]));
    localStorage.setItem("archivosBlog", JSON.stringify([]));
    alert("Todo el contenido ha sido borrado");
  }
}

// ====== SISTEMA ADMIN ======
function verificarAdmin() {
  const password = document.getElementById('admin-password').value;
  if (password === 'mi-contraseña-secreta') {
    esAdmin = true;
    document.getElementById('panel-admin').style.display = 'block';
    document.getElementById('admin-login').style.display = 'none';
    localStorage.setItem('esAdmin', 'true');
    alert('Modo administrador activado');
  } else {
    alert('Contraseña incorrecta');
  }
}

// ====== FUNCIONES PARA SUBIR ARCHIVOS ======
async function manejarSubidaArchivo(input) {
  console.log("Archivo seleccionado!");
  const archivo = input.files[0];
  if (!archivo) {
    console.log("No se seleccionó archivo");
    return;
  }

  // Verificar si es admin
  if (!esAdmin) {
    alert('Solo el administrador puede subir archivos');
    return;
  }

  try {
    // 1. Subir a GitHub y obtener URL pública
    const urlGitHub = await subirArchivoAGitHub(archivo);
    
    if (!urlGitHub) {
      throw new Error('No se pudo subir el archivo a GitHub');
    }

    console.log("Archivo subido a GitHub:", urlGitHub);
    
    // 2. Crear entrada en el blog con la URL de GitHub
    if (archivo.type.startsWith('image/')) {
      crearEntradaImagen(urlGitHub, archivo.name);
    } else if (archivo.type.startsWith('audio/')) {
      crearEntradaAudio(urlGitHub, archivo.name);
    } else {
      crearEntradaDocumento(urlGitHub, archivo.name);
    }

    // 3. Guardar referencia en localStorage
    guardarMetadatosArchivo(urlGitHub, archivo.type, archivo.name);

  } catch (error) {
    console.error('Error en la subida:', error);
    alert('Error al subir el archivo: ' + error.message);
  }
}

async function subirArchivoAGitHub(archivo) {
  try {
    // Convertir archivo a Base64
    const reader = new FileReader();
    const promesa = new Promise((resolve) => {
      reader.onload = () => resolve(reader.result.split(',')[1]);
    });
    reader.readAsDataURL(archivo);
    const contenidoBase64 = await promesa;

    // Subir a GitHub
    const response = await fetch(
      `https://api.github.com/repos/${GH_CONFIG.usuario}/${GH_CONFIG.repo}/contents/archivos/${Date.now()}-${archivo.name}`,
      {
        method: 'PUT',
        headers: {
          'Authorization': `token ${GH_CONFIG.token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: `Subir ${archivo.name}`,
          content: contenidoBase64,
          branch: 'main',
        }),
      }
    );

    const data = await response.json();
    return data.content.download_url;
  } catch (error) {
    console.error('Error subiendo archivo:', error);
    return null;
  }
}

function crearEntradaImagen(src, nombre) {
  const div = document.getElementById('blog');
  const contenedor = document.createElement('div');
  contenedor.className = 'entrada-blog';
  
  const img = document.createElement('img');
  img.src = src;
  img.alt = nombre;
  img.style.maxWidth = '100%';
  img.style.maxHeight = '300px';
  img.style.borderRadius = '8px';
  img.style.marginBottom = '10px';
  
  const botonBorrar = document.createElement('button');
  botonBorrar.textContent = 'X';
  botonBorrar.className = 'borrar-entrada';
  botonBorrar.onclick = function() {
    if (confirm('¿Borrar esta imagen?')) {
      contenedor.remove();
      eliminarArchivoDeStorage(src);
    }
  };
  
  contenedor.appendChild(img);
  contenedor.appendChild(botonBorrar);
  div.appendChild(contenedor);
}

function crearEntradaAudio(src, nombre) {
  const div = document.getElementById('blog');
  const contenedor = document.createElement('div');
  contenedor.className = 'entrada-blog';
  
  const audio = document.createElement('audio');
  audio.controls = true;
  audio.src = src;
  audio.style.width = '100%';
  audio.style.marginBottom = '10px';
  
  const botonBorrar = document.createElement('button');
  botonBorrar.textContent = 'X';
  botonBorrar.className = 'borrar-entrada';
  botonBorrar.onclick = function() {
    if (confirm('¿Borrar este audio?')) {
      contenedor.remove();
      eliminarArchivoDeStorage(src);
    }
  };
  
  contenedor.appendChild(audio);
  contenedor.appendChild(botonBorrar);
  div.appendChild(contenedor);
}

function crearEntradaDocumento(src, nombre) {
  const div = document.getElementById('blog');
  const contenedor = document.createElement('div');
  contenedor.className = 'entrada-blog';
  
  const enlace = document.createElement('a');
  enlace.href = src;
  enlace.textContent = `📄 ${nombre}`;
  enlace.download = nombre;
  enlace.style.color = '#ff69b4';
  enlace.style.textDecoration = 'none';
  enlace.style.fontWeight = 'bold';
  enlace.style.marginBottom = '10px';
  enlace.style.padding = '8px 15px';
  enlace.style.background = 'rgba(0, 0, 0, 0.3)';
  enlace.style.borderRadius = '5px';
  enlace.style.border = '1px solid #ff69b4';
  enlace.style.display = 'inline-block';
  
  const botonBorrar = document.createElement('button');
  botonBorrar.textContent = 'X';
  botonBorrar.className = 'borrar-entrada';
  botonBorrar.onclick = function() {
    if (confirm('¿Borrar este documento?')) {
      contenedor.remove();
      eliminarArchivoDeStorage(src);
    }
  };
  
  contenedor.appendChild(enlace);
  contenedor.appendChild(botonBorrar);
  div.appendChild(contenedor);
}

// ====== ALMACENAMIENTO DE ARCHIVOS ======
function guardarMetadatosArchivo(url, tipo, nombreOriginal) {
  const archivos = JSON.parse(localStorage.getItem('archivosBlog') || '[]');
  archivos.push({
    url: url,
    tipo: tipo,
    nombre: nombreOriginal,
    fecha: new Date().toISOString()
  });
  localStorage.setItem('archivosBlog', JSON.stringify(archivos));
}

function cargarArchivosGuardados() {
  const archivos = JSON.parse(localStorage.getItem('archivosBlog') || '[]');
  archivos.forEach(archivo => {
    if (
