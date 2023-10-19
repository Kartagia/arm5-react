Pipeline {
  agent any
  stages {
    stage('Hello') {
      steps {
        echo "Hello from Menu component branch"
      }
    }
    stage("Compile MENU") {
      // Compiles the JSX components into a single file containing the component and all of its
      // sub-components, and renders the component.
      steps {
        echo "Compiling the JSX components"
        perl -e 'my $mode = "import"; my %imports = {}; ' Menu.jsx >component.menu.js
        echo "Compile completed"
      }
    }
    stage("Build") {
      // Builds the project.
      steps {
        echo "Build completed"       
      }
    }
  }
}