# Recepción de Textos Escolares

## Decisiones de diseño

- **Vue 3 + Composition API**: permite una sintaxis clara y componible para manejar estado y lógica reutilizable.
- **Almacenamiento en `localStorage`**: se optó por persistir los datos localmente para conservar la información entre sesiones sin requerir un backend.
- **Componentización**: la aplicación se divide en componentes (`Recepciones`, `Libros`, `Proveedores`) para mejorar la mantenibilidad y escalabilidad.
- **Vite como bundler**: ofrece un entorno de desarrollo rápido y una configuración mínima.
- **Validaciones reactivas**: se usan `computed` y `watch` para validar formularios y mantener coherencia en los datos.

## Cómo ejecutar

```bash
npm install
npm run dev
```

## Construcción del proyecto

```bash
npm run build
```
