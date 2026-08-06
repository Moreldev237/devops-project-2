pipeline {
    agent any

    options {
        timestamps()
        disableConcurrentBuilds()
    }

    // Déclenché automatiquement par le webhook GitHub que je vais configuré sur le repo
    triggers {
        githubPush()
    }

    environment {
        DOCKERHUB_CREDENTIALS = credentials('dockerhub-credentials')   // credentials Jenkins (username/password)
        DOCKERHUB_USER        = 'devops_project_2'
        IMAGE_TAG             = "${env.BUILD_NUMBER}"
        BACKEND_IMAGE         = "${DOCKERHUB_USER}/formapp-backend"
        NGINX_IMAGE           = "${DOCKERHUB_USER}/formapp-nginx"

        EC2_HOST = "${env.EC2_HOST}"  // Adresse IP publique de l'instance EC2
        EC2_SSH_CRED = "${env.EC2_SSH_CRED}"  // ID de la credential Jenkins SSH (clé privée)
    }

    stages {

        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Build Backend Image') {
            steps {
                sh "docker build -t ${BACKEND_IMAGE}:${IMAGE_TAG} -t ${BACKEND_IMAGE}:latest ./backend"
            }
        }

        stage('Build Frontend + Nginx Image') {
            steps {
                sh "docker build -t ${NGINX_IMAGE}:${IMAGE_TAG} -t ${NGINX_IMAGE}:latest -f nginx/Dockerfile ."
            }
        }

        stage('Push to Docker Hub') {
            steps {
                sh "echo ${env.DOCKERHUB_CREDENTIALS_PSW} | docker login -u ${env.DOCKERHUB_CREDENTIALS_USR} --password-stdin"
                sh "docker push ${BACKEND_IMAGE}:${IMAGE_TAG}"
                sh "docker push ${BACKEND_IMAGE}:latest"
                sh "docker push ${NGINX_IMAGE}:${IMAGE_TAG}"
                sh "docker push ${NGINX_IMAGE}:latest"
            }
        }

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

    post {
        always {
            node {
                sh "docker logout || true"
            }
        }
        success {
            echo "Déploiement réussi sur EC2."
        }
        failure {
            echo "Le pipeline a échoué."
        }
    }
}
