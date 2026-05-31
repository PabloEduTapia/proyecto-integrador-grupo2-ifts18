# PPIV · Proyecto Integrador · Supermarket Sales 2014–2017

Sitio de presentación del trabajo práctico final de la materia **PPIV: Proyecto Integrador**.

## Datos académicos

- **Instituto:** Instituto de Formación Técnica Superior N°18
- **Carrera:** Técnico Superior en Ciencia de Datos e Inteligencia Artificial (TSCDIA)
- **Materia:** PPIV: Proyecto Integrador
- **Profesor:** Hugo Damián Planiscig
- **Proyecto:** Análisis Exploratorio de Datos sobre Supermarket Sales 2014–2017

## Estructura del repositorio

```text
.
├── index.html
├── assets/
│   ├── css/
│   │   └── styles.css
│   └── js/
│       ├── data.js
│       ├── charts.js
│       └── main.js
├── data/
│   ├── df_sales_crudo.csv
│   ├── df_sales_limpio_para_powerbi.csv
│   └── df_sales_limpio_para_powerbi.xlsx
├── docs/
│   ├── informe-final-supermarket-sales.pdf
│   └── consigna-ppiv-proyecto-integrador.md
├── notebooks/
│   └── notebook-proyecto-integrador.ipynb
└── powerbi/
    └── dashboard-powerbi.pbix
```

## Cómo publicarlo en GitHub Pages

1. Crear un repositorio en GitHub.
2. Subir todos los archivos de esta carpeta a la raíz del repositorio.
3. Ir a **Settings → Pages**.
4. En **Build and deployment**, seleccionar:
   - Source: `Deploy from a branch`
   - Branch: `main`
   - Folder: `/ (root)`
5. Guardar y esperar a que GitHub genere la URL pública.

La URL quedará con un formato similar a:

```text
https://TU_USUARIO.github.io/NOMBRE_DEL_REPOSITORIO/
```

## Notas

- El sitio no requiere instalación ni dependencias externas.
- El archivo `index.html` debe quedar en la raíz del repositorio para que GitHub Pages lo publique correctamente.
- El archivo `.nojekyll` se incluye para evitar que GitHub Pages ignore carpetas o archivos por reglas de Jekyll.


## Estilo visual

Esta versión del sitio utiliza una identidad visual más orientada al negocio minorista y supermercados, con íconos, ilustraciones y paleta cromática alineadas a ventas, retail y performance comercial.
