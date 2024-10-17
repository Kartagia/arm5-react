
pipeline {
    agent linux

    stages {
        stage('Build') {
            echo "Building the module"
        }
        stage('Test') {
            echo 'Running test'
            sh "cp test.html testkit/public/ && cd testkit && npm run test"
        }
    }
}