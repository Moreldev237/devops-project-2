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
        IMAGE_TAG = 'latest'
        BACKEND_IMAGE = "${DOCKERHUB_USER}/formapp-backend"
        NGINX_IMAGE = "${DOCKERHUB_USER}/formapp-nginx"
        EC2_HOST = "${env.EC2_HOST}"
        EC2_SSH_CRED = "${env.EC2_SSH_CRED}"
    }

    stages {

        stage('Checkout') {
            steps {
                checkout scm
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
                ]) {

                    sshagent(credentials: ["${EC2_SSH_CRED}"]) {

                        sh '''
                            ssh -o StrictHostKeyChecking=no ${EC2_HOST} "
                                set -e

                                echo ${DOCKERHUB_PASSWORD} | docker login \
                                -u ${DOCKERHUB_USERNAME} \
                                --password-stdin

                                cd /home/ec2-user/app

                                docker compose pull
                                docker compose up -d --remove-orphans

                                docker image prune -f
                            "
                        '''
                    }
                }
            }
        }
    }


    post {

        always {
            node {
                echo "Fin du pipeline"
            }
        }

        success {
            node {
                echo "Déploiement réussi"
            }
        }

        failure {
            node {
                echo "Déploiement échoué"
            }
        }
    }
}