FROM tiangolo/uvicorn-gunicorn-starlette:python3.7

EXPOSE 5000
WORKDIR /app
COPY ./requirements.txt /app/requirements.txt
ENV http_proxy=
ENV https_proxy=
ENV no_proxy=
RUN apt-get update && apt-get -y install cmake protobuf-compiler
RUN apt-get -y install build-essential libopenblas-dev liblapack-dev python3 python3-dev python3-pip
RUN pip install -r  requirements.txt

COPY . /app

CMD ["gunicorn","-b", "0.0.0.0:5000", "app:app","-k","uvicorn.workers.UvicornWorker","-w","2"]
