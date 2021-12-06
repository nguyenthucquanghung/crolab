# I. Pull official base image
FROM python:3.8.10-alpine

# II. Set work directory
WORKDIR /usr/src/app

# III. Set environment variables
# 	1. PYTHONDONTWRITEBYTECODE: Prevents Python from writing pyc files to disc (equivalent to python -B option)
ENV PYTHONDONTWRITEBYTECODE 1
# 	2. PYTHONUNBUFFERED: Prevents Python from buffering stdout and stderr (equivalent to python -u option)
ENV PYTHONUNBUFFERED 1

# IV. Install dependencies
# 	1. Upgrade pip & copy requirements.txt file
RUN pip install --upgrade pip
COPY ./requirements.txt .
#   2. Install dependencies
RUN apk update
RUN apk add --no-cache mariadb-connector-c-dev
RUN apk update
RUN apk add python3 python3-dev mariadb-dev build-base netcat-openbsd
RUN pip install -r requirements.txt 

# V. Copy the whole project
COPY . .
