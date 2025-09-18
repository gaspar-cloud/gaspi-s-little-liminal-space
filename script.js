// ====== FUNCIONES EXISTENTES (MANTENER TODAS) ======

// Función para el botón de saludo
function saludar() {
  alert("felipe was here");
}

// Cargar contenido guardado al iniciar Y configurar subida de archivos
document.addEventListener('DOMContentLoaded', function() {
  cargarContenido();
  actualizarContador();
  
  // Configurar evento para subida de archivos
  const inputArchivo = document.getElementById('subir-archivo');
  if (inputArchivo) {
    inputArchivo.addEventListener('change', function(e) {
      console.log('📁 Archivo seleccionado (event listener)');
      manejarSubidaArchivo(this);
    });
  }
});

// Función para agregar texto al blog (MANTENER ESTA)
function agregarTexto() {
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

// Función para guardar en localStorage (MANTENER ESTA)
function guardarEnStorage() {
  const entradas = [];
  const elementos = document.querySelectorAll('#blog .entrada-blog p');
  elementos.forEach(function(elemento) {
    entradas.push(elemento.textContent);
  });
  localStorage.setItem("blogEntradas", JSON.stringify(entradas));
}

// Función para cargar contenido (MANTENER ESTA)
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

// Contador de visitas (MANTENER ESTA)
function actualizarContador() {
  let contador = localStorage.getItem("visitas") || 0;
  contador = parseInt(contador) + 1;
  localStorage.setItem("visitas", contador);
  document.getElementById("contador").textContent = contador;
}

// Función para borrar todo el contenido (MANTENER ESTA)
function borrarTodo() {
  const div = document.getElementById("blog");
  if (div.children.length === 0) {
    alert("No hay nada que borrar");
    return;
  }
  
  if (confirm("¿Estás seguro de que quieres borrar TODO el contenido?")) {
    div.innerHTML = "";
    localStorage.setItem("blogEntradas", JSON.stringify([]));
    alert("Todo el contenido ha sido borrado");
  }
}

// ====== FUNCIONES NUEVAS PARA SUBIR ARCHIVOS (SOLO ESTAS 4) ======

function manejarSubidaArchivo(input) {
  console.log("Archivo seleccionado!");
  const archivo = input.files[0];
  if (!archivo) {
    console.log("No se seleccionó archivo");
    return;
  }
  
  const reader = new FileReader();
  
  reader.onload = function(e) {
    const contenido = e.target.result;
    console.log("Archivo cargado correctamente");
    
    if (archivo.type.startsWith('image/')) {
      crearEntradaImagen(contenido, archivo.name);
    } else if (archivo.type.startsWith('audio/')) {
      crearEntradaAudio(contenido, archivo.name);
    } else {
      crearEntradaDocumento(contenido, archivo.name);
    }
  };
  
  reader.readAsDataURL(archivo);
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
    }
  };
  
  contenedor.appendChild(enlace);
  contenedor.appendChild(botonBorrar);
  div.appendChild(contenedor);
}