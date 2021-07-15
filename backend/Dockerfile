FROM python:3
COPY requirements.txt ./
COPY generate-certificate.sh /generate-certificate.sh
RUN pip install --no-cache-dir -r requirements.txt
RUN mkdir /root/certs && cd /root/certs
EXPOSE 5000
EXPOSE 9090
CMD [ "/generate-certificate.sh" ]