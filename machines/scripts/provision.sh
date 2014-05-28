main() {
  upgrade
  install_mongo
  install_node
  install_packages
}

packages=(
  texlive-full
  imagemagick
)

upgrade() {
  apt-get update
  apt-get upgrade
}

install_mongo() {
  apt-key adv --keyserver hkp://keyserver.ubuntu.com:80 --recv 7F0CEB10

  echo 'deb http://downloads-distro.mongodb.org/repo/ubuntu-upstart dist 10gen' |
  tee /etc/apt/sources.list.d/mongodb.list

  apt-get update
  apt-get install -y mongodb-org
}

install_node() {
  apt-get install -y python-software-properties
  add-apt-repository -y ppa:chris-lea/node.js
  apt-get update
  apt-get install -y nodejs
}

install_packages() {
  apt-get update
  apt-get -y install ${packages[@]}
}

main $@
