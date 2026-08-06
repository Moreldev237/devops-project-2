pipeline {
    // Utilise n'importe quel agent Jenkins disponible pour exécuter le pipeline.
    agent any

    options {
        // Ajoute l'heure dans les logs pour faciliter le suivi des exécutions.
        timestamps()
        // Empêche plusieurs builds du même job de se lancer en parallèle.
        disableConcurrentBuilds()
    }

    // Déclenche automatiquement le pipeline lorsqu'un push est envoyé sur GitHub.
    triggers {
        githubPush()
    }

    environment {
        // Récupère les identifiants Docker Hub depuis Jenkins (Credentials).
        DOCKERHUB_CREDENTIALS = credentials('dockerhub-credentials')
        // Nom d'utilisateur Docker Hub utilisé pour taguer les images.
        DOCKERHUB_USER = 'devops_project_2'
        // Numéro du build Jenkins, utilisé comme tag d'image.
        IMAGE_TAG = "${env.BUILD_NUMBER}"
        // Nom de l'image Docker du backend.
        BACKEND_IMAGE = "${DOCKERHUB_USER}/formapp-backend"
        // Nom de l'image Docker du frontend/nginx.
        NGINX_IMAGE = "${DOCKERHUB_USER}/formapp-nginx"

        // Adresse IP publique ou domaine de l'instance EC2.
        EC2_HOST = "${env.EC2_HOST}"
        // ID de la credential Jenkins contenant la clé SSH privée pour EC2.
        EC2_SSH_CRED = "${env.EC2_SSH_CRED}"
    }

    stages {

        // 1. Récupère le code source depuis le dépôt GitHub.
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        // 2. Construit l'image Docker du backend Django.
        stage('Build Backend Image') {
            steps {
                sh "docker build -t ${BACKEND_IMAGE}:${IMAGE_TAG} -t ${BACKEND_IMAGE}:latest ./backend"
            }
        }

        // 3. Construit l'image Docker du frontend React + Nginx.
        stage('Build Frontend + Nginx Image') {
            steps {
                sh "docker build -t ${NGINX_IMAGE}:${IMAGE_TAG} -t ${NGINX_IMAGE}:latest -f nginx/Dockerfile ."
            }
        }

        // 4. Se connecte à Docker Hub et pousse les images construites.
        stage('Push to Docker Hub') {
            steps {
                sh "echo ${env.DOCKERHUB_CREDENTIALS_PSW} | docker login -u ${env.DOCKERHUB_CREDENTIALS_USR} --password-stdin"
                sh "docker push ${BACKEND_IMAGE}:${IMAGE_TAG}"
                sh "docker push ${BACKEND_IMAGE}:latest"
                sh "docker push ${NGINX_IMAGE}:${IMAGE_TAG}"
                sh "docker push ${NGINX_IMAGE}:latest"
            }
        }

        // 5. Déploie les images sur la machine EC2 via SSH.
        stage('Deploy to EC2') {
            steps {
                sshagent(credentials: ["${env.EC2_SSH_CRED}"]) {
                    sh """
                        ssh -o StrictHostKeyChecking=no ${env.EC2_HOST} '
                            cd /home/ec2-user/app &&
                            export DOCKERHUB_USER=${env.DOCKERHUB_USER} &&
                            export IMAGE_TAG=latest &&
                            docker compose pull &&
                            docker compose up -d --remove-orphans &&
                            docker image prune -f
                        '
                    """
                }
            }
        }
    }
}

