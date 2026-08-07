pipeline {
    agent any

    options {
        timestamps()
        disableConcurrentBuilds()
    }

    triggers {
        githubPush()
    }

    environment {
        DOCKERHUB_USER = 'devops_project_2'
        IMAGE_TAG = "${BUILD_NUMBER}"
        BACKEND_IMAGE = "${DOCKERHUB_USER}/formapp-backend"
        NGINX_IMAGE = "${DOCKERHUB_USER}/formapp-nginx"

        EC2_HOST = "ubuntu@ec2-54-172-115-113.compute-1.amazonaws.com"
    }

    stages {

        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Build and Push Images') {
            steps {
                withCredentials([
                    usernamePassword(
                        credentialsId: 'dockerhub-credentials',
                        usernameVariable: 'DOCKERHUB_USERNAME',
                        passwordVariable: 'DOCKERHUB_PASSWORD'
                    )
                ]) 
                node{
                    
                    sh '''
                    echo "$DOCKERHUB_PASSWORD" | docker login -u "$DOCKERHUB_USERNAME" --password-stdin

                    docker build -t "$BACKEND_IMAGE:$IMAGE_TAG" ./backend
                    docker push "$BACKEND_IMAGE:$IMAGE_TAG"

                    docker build -t "$NGINX_IMAGE:$IMAGE_TAG" .
                    docker push "$NGINX_IMAGE:$IMAGE_TAG"
                    '''
                }
            }
        }

        stage('Deploy to EC2') {
            steps {

                withCredentials([
                    usernamePassword(
                        credentialsId: 'dockerhub-credentials',
                        usernameVariable: 'DOCKERHUB_USERNAME',
                        passwordVariable: 'DOCKERHUB_PASSWORD'
                    )
                ]) node{

                    sshagent(credentials: ['formation_devops_keys']) {

                        sh '''
                        ssh -o StrictHostKeyChecking=no $EC2_HOST <<'SSH'
                            set -e

                            echo "$DOCKERHUB_PASSWORD" | docker login -u "$DOCKERHUB_USERNAME" --password-stdin

                            cd /home/ubuntu/app

                            docker compose pull
                            docker compose up -d --remove-orphans

                            docker image prune -f
                        SSH
                        '''
                    }
                }
            }
        }
    }

    post {
        always {
            echo "Fin du pipeline"
        }

        success {
            echo "Déploiement réussi"
        }

        failure {
            echo "Déploiement échoué"
        }
    }
}