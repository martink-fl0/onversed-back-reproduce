# Usar una imagen oficial de Node.js como base
FROM node:16 as builder

# Definir el directorio de trabajo
WORKDIR /usr/src/app

# Copiar el package.json y package-lock.json
COPY package*.json ./

# Instalar las dependencias
RUN npm install

# Copiar el resto de los archivos de la aplicación
COPY . .

# Construir la aplicación
RUN npm run build

# Iniciar con una imagen limpia
FROM node:16-slim

WORKDIR /usr/src/app

# Copiar las dependencias y los archivos compilados desde la etapa anterior
COPY --from=builder /usr/src/app/node_modules ./node_modules
COPY --from=builder /usr/src/app/dist ./dist
COPY --from=builder /usr/src/app/src/i18n ./src/i18n

# Exponer el puerto en el que se ejecutará Next.js (por defecto es 3000)
EXPOSE 8080

# Definir el comando para ejecutar la aplicación
CMD ["node", "dist/main"]
