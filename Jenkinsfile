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

        DOCKERHUB_USER = 'moreldev237'

        IMAGE_TAG = "${BUILD_NUMBER}"

        BACKEND_IMAGE = "${DOCKERHUB_USER}/formapp-backend"

        NGINX_IMAGE = "${DOCKERHUB_USER}/formapp-nginx"


        EC2_HOST = "ubuntu@ec2-54-172-115-113.compute-1.amazonaws.com"

    }



    stages {


        stage('Checkout SCM') {

            steps {

                checkout scm

            }

        }



        stage('Docker Login') {

            steps {


                withCredentials([

                    usernamePassword(
                        credentialsId: 'dockerhub-credentials',
                        usernameVariable: 'DOCKERHUB_USERNAME',
                        passwordVariable: 'DOCKERHUB_PASSWORD'
                    )

                ]) {


                    sh '''

                    echo "$DOCKERHUB_PASSWORD" | docker login \
                    -u "$DOCKERHUB_USERNAME" \
                    --password-stdin

                    '''

                }

            }

        }





        stage('Build Backend Image') {

            steps {

                sh '''

                echo "Building backend image..."

                docker build \
                -t "$BACKEND_IMAGE:$IMAGE_TAG" \
                ./backend


                '''

            }

        }





        stage('Push Backend Image') {

            steps {

                sh '''

                echo "Pushing backend image..."

                docker push \
                "$BACKEND_IMAGE:$IMAGE_TAG"


                '''

            }

        }





        stage('Build Nginx Image') {
    steps {
        sh '''
        echo "Building nginx image..."
        docker build \
        -t "$NGINX_IMAGE:$IMAGE_TAG" \
        -f ./nginx/Dockerfile \
        .
        '''
    }
}




        stage('Push Nginx Image') {

            steps {

                sh '''

                echo "Pushing nginx image..."

                docker push \
                "$NGINX_IMAGE:$IMAGE_TAG"


                '''

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



                    sshagent(credentials: ['formation_devops_keys']) {


                        sh '''

                        ssh -o StrictHostKeyChecking=no $EC2_HOST <<EOF


                        set -e



                        echo "$DOCKERHUB_PASSWORD" | docker login \
                        -u "$DOCKERHUB_USERNAME" \
                        --password-stdin



                        cd /home/ubuntu/app



                        export IMAGE_TAG=$IMAGE_TAG



                        echo "Pulling new images..."

                        docker compose pull



                        echo "Restarting containers..."

                        docker compose up -d --remove-orphans



                        echo "Cleaning unused images..."

                        docker image prune -f



EOF

                        '''

                    }

                }

            }

        }





        stage('Verify Deployment') {


            steps {


                sshagent(credentials: ['formation_devops_keys']) {


                    sh '''

                    ssh -o StrictHostKeyChecking=no $EC2_HOST <<EOF


                    docker ps


EOF

                    '''

                }

            }

        }


    }





    post {


        always {

            echo "Fin du pipeline"

        }



        success {

            echo "Déploiement réussi 🚀"

        }



        failure {

            echo "Déploiement échoué ❌"

        }


    }

}