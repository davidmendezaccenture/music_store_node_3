FROM node:20-alpine

# Crear directorio de trabajo
WORKDIR /app

# Copiar package.json y lock
COPY package*.json ./

# Instalar dependencias
RUN npm install

# Copiar el resto de los archivos
COPY . .

# Exponer el puerto (usa el mismo que configures en server.js)
EXPOSE 8080

# Ejecutar tu aplicación Node.js
CMD ["node", "server.js"]
