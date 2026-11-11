# Seguridad

## Cómo reportar un problema

Si encuentras una vulnerabilidad, repórtala de forma privada desde la pestaña Security de este repositorio, con la opción "Report a vulnerability". Por favor no abras un issue público con los detalles ni pruebes con cuentas de otras personas.

Incluye qué pantalla o función afecta, cómo reproducirlo y qué impacto crees que tiene. Es un proyecto personal, así que la respuesta puede tardar unos días.

## Alcance

La app tiene cuentas por invitación y guarda el plan y el avance de cada persona. Lo que importa es:

- Que una persona no pueda ver ni modificar los datos de otra.
- Que nadie sin sesión o sin permiso de administrador pueda usar funciones de administración.
- Que no se publiquen llaves secretas, contraseñas ni datos personales en el repositorio.

## Medidas que ya existen

- Política de contenido sin scripts en línea, sin bloques de estilo inyectables y con conexiones limitadas a los servidores que usa la app.
- Cabeceras de seguridad, HSTS y aislamiento de origen en todas las respuestas.
- Contraseñas de al menos 10 caracteres con verificación contra filtraciones conocidas, y cuenta ligada a un dispositivo.
- La llave que aparece en el código es la publicable, pública por diseño. La seguridad real está en las reglas de la base de datos.
- Dependabot revisa las acciones de GitHub cada semana, y el análisis de secretos y la protección contra subir llaves están activos.
