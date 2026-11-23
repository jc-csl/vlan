# VLAN · Apuntes visuales (CCNA)

Apuntes interactivos sobre VLAN con animaciones paso a paso.

Para tener la carpeta en local: `git clone https://github.com/jc-csl/vlan.git`.
Abre `index.html` en el navegador (no necesita servidor ni dependencias).
El botón «Modo presentación» amplía los apuntes a pantalla completa si el navegador lo permite; «Volver al inicio» lleva a la portada sin reiniciar las animaciones. Se puede salir de pantalla completa con el botón o con Esc.

Contenido:

1. Qué es una VLAN, beneficios y tipos
2. Un cable / un switch → 3 VLAN (subinterfaces `g0/0.10`, `.20`, `.30`)
3. Dominio de broadcast con y sin VLAN
4. Etiquetado en puertos access y troncales
5. Estructura de la etiqueta 802.1Q
6. Troncal, VLAN nativa y VLAN permitidas
7. Comunicación entre VLAN (router-on-a-stick)
8. Comandos Cisco (switch y router) copiables
9. DTP y VTP
10. Resumen y buenas prácticas
11. Laboratorio interactivo
12. Test final de 20 preguntas con puntuación, soluciones y explicaciones

El test se corrige al pulsar «Corregir test»: muestra aciertos, errores y preguntas sin responder. Puedes cambiar las respuestas y volver a corregir, o reiniciarlo.
## Laboratorio interactivo

Abre `laboratorio.html` (un único archivo, sin dependencias): red con 2 switches y un router, misiones con corrección automática y terminal IOS simulada. Cada solución permite aplicar los comandos y corregir los requisitos anteriores; a partir de la tercera misión también restablece las direcciones de los PC. Para configurar el router puede quitar direcciones IP en conflicto o desactivar otras subinterfaces. Los comandos ejecutados aparecen en la terminal de cada equipo y se puede seguir configurando manualmente. Los colores de los puertos reflejan la VLAN configurada y puedes seleccionar el destino de un ping o escribir su IP.

El botón «Pantalla completa» amplía el laboratorio y ajusta la distribución al espacio disponible. Se puede salir con el mismo botón o con Esc.
Autocomprobación del simulador: abre `laboratorio.html#selftest` y mira la consola del navegador (`selftest: OK`).
Las animaciones de ping muestran la petición de ida y la respuesta ICMP de vuelta cuando existe conectividad; también indican si falla el recorrido.
