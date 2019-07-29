FROM node:12.6.0

COPY start.sh /start.sh
COPY /api/ /app/api/ 
RUN chmod 755 /start.sh
CMD ["sh", "start.sh"]