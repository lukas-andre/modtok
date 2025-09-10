# MODTOK

## Visión
Facilitar la vida de las personas que buscan construir un hogar modular por la vía de mejorar la posibilidad de encuentro entre los usuarios y fabricantes, proveedores, servicios, productos complementarios.

## Misión
Modtok será un agregador centrado en el mercado de la construcción y habilitación de casas como segunda vivienda para descanso o fines turísticos en Chile, con prioridad en casas modulares y prefabricadas.

## Posicionamiento

- Se busca lograr un equilibrio entre lo funcional y el diseño, de modo que el filtrado y herramientas sean útiles y efectivas pero sin sacrificar el potencial estético y de diseño del rubro.
- Look & Feel: se busca un diseño limpio pero altamente intuitivo y efectivo, sin contaminación visual de los objetos de la web y que permitan que siempre el foco del usuario esté en las imágenes de productos y contenidos atractivos.
- Los espacios de contenido superior dan la oportunidad no sólo de publicar blogs y novedades, sino publicar entrevistas a personas relevantes en el rubro de modo que sea un espacio socialmente validado en el nicho.
- En este documento se adjuntan y explican referencias positivas y negativas de sitios.

## Nomenclatura

Categorías : tipos de proveedor [Fabricantes, Casas, Habilitación y Servicios, Decoración y Mejoras]

Niveles: Premium | Destacado | Standard

Comercialmente las categorías de importancia estratégica son aquellas que tienen una oportunidad de contenido/imágenes que eleve la experiencia del sitio ya sea por aspectos de diseño, materialidad, belleza escénica, sofisticación. 
En principio aplica para Fabricantes | Casas | Decoración y Mejoras pero es un aspecto que evolucionará en el tiempo. 


## Secciones

Todas las secciones cargan por default contenidos de las categorías Casas | Fabricantes | Decoración y Mejoras.
Sección Premium 
Sección Destacada 
Sección Standard
Sección HotSpots
Sección Blogs / Proyectos / Novedades 
Footer


# Proceso levantamiento data iterativo
Investigación de Mercado
Scraping de fabricantes y otros proveedores
Detección de categorías de fabricantes y proveedores
Detección de features casas
Estandarización de features casas
Detección de coberturas
Cálculo de indicadores fabricantes (precio min m2 | precio max m2)
Detección de hotspots (localidades de alto interés)
Generación de métricas de mercado
 
# Definiciones técnicas pendientes
Stack
Base de datos
Mecánica de actualización periódica de data.
Recolección y almacenamiento de imágenes.
Opciones de administrador de contenidos como Payload y otros para Astrojs


# Funcionalidad base (usuario cliente registrado)
Los usuarios [clientes] registrados tienen acceso a su bandeja / cuenta.
Los usuarios [clientes] permiten o niegan (condición legal) recibir ofertas y promociones de Modtok por correo.
La cuenta de usuarios muestra el listado de seguimiento agrupado por categoría.
Los usuarios registrados podrían agregar proveedores y productos de cualquier tipo a su lista de seguimiento.
Los usuarios no registrados estarán solo accederán a un teaser del sitio sin oportunidad real de uso.

# Funcionalidad base (proveedores pago)
En la versión base el proveedor puede:
-  Acceder a los mismos contenidos que un usuario registrado.
-  Textos e imágenes de los proveedores son administrados por admin Modtok y son parte de la negociación del contenido del landing ( ejemplo de sitios que funcionan asi : revistaambientes.cl)
Línea de tiempo con cantidad usuarios que lo agregan y quitan a la lista de seguimientos en una semana. (reporte básico).



# Oportunidades Comerciales
Todos los fabricantes acceden a 3 niveles de publicación (como fabricante y también sus casas):
Premium [pago fee] : ficha/contenedor Premium + landing + push de notificaciones 
Destacado [pago fee] : ficha/contenedor destacado (imagen y datos básicos, sin push)
Standard [gratis] : Listing sin imagen (datos básicos de contacto).
Las listas de seguimiento de los usuarios reflejan alta intención de tipo MOFU para esos proveedores.
- Oportunidad de ofertas y promociones a usuarios MOFU.

# Contenidos
La carga de contenidos de listing se realiza a través de:
Scraping web (para base Standard)
Registro on demand. Solicitud de registro de un proveedor.

# Notas
Hay tipos de proveedor con oportunidades de exhibición de imágenes de atractivo visual (fabricantes|casas|algunos productos). Esos casos pueden aplicar a Premium | Destacado.
Para no complejizar desarrollo, se puede analizar caso a caso en el momento de la venta del slot si el proveedor aplica para fee Premium o sólo destacado, de modo que no generar una regla restrictiva en el sistema pero sujeta a criterio por atractivo de las imágenes que puede exhibir.
Existen otros tipo de proveedor con información más centrada en datos y texto sin oportunidad de imagen Premium. Si Destacado.

# Slugs
Rutas URL de blog, noticias y landings Premium para potenciar SEO.
Pendiente definir estructura.

Registro / Login habilita al cliente para entrar a su cuenta y ver lista de seguimiento.
Contenido Destacado puede alojar blogs /noticias/proyectos/entrevistas o contenido asociado a un anunciante Premium.
Filtro Superior esta asociado a las categorías [Casas | Fabricantes | Habilitación & Servicios | Decoración y Mejoras].
Sección Premium y Destacados en la primera carga o desde home, muestra una mezcla de categorías Casas, Fabricantes y otros proveedores que tengan activo Premium | Destacados. 
Si en el filtro superior se selecciona Casas se cargará exclusivamente Casas en estas secciones. 
Filtros laterales y etiquetas están asociados a la apertura de una selección de categorías.
Sección de listing standard solo tiene texto [Nombre de Empresa o Persona, Rubro, Servicio, Región, Teléfono, link para agregar a seguimiento]
Sección de hot spots para exponer landings dedicados a zonas geográficas de alta actividad en construcción de casas modulares y prefabricadas.
Sección de Blog / Novedades para contenido SEO.















