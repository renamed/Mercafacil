FROM bitnami/mariadb:latest

ENV ALLOW_EMPTY_PASSWORD=no
ENV MARIADB_USER=mercafacil
ENV MARIADB_ROOT_PASSWORD=senhasecreta321
ENV MARIADB_PASSWORD=senhasecreta123
ENV MARIADB_DATABASE=db_mercafacil

COPY setup.sql /docker-entrypoint-initdb.d