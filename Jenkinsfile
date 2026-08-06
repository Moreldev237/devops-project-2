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

                    sshagent(credentials: ['formation_devops_keys.pem']) {

                        sh '''
                        ssh -o StrictHostKeyChecking=no ubuntu@EC2_IP_ADDRESS "
                            set -e

                            echo $DOCKERHUB_PASSWORD | docker login \
                            -u $DOCKERHUB_USERNAME \
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