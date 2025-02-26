FROM postgres:17-alpine

# pour exécuter des commandes SQL lors du premier démarrage du container
COPY init.sql /docker-entrypoint-initdb.d/

EXPOSE 5432
