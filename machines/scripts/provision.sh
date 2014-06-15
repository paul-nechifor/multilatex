main() {
  upgrade
  install_mongo
  install_node
  install_packages
  create_user
}

packages=(
  # In order to build canvas.
  build-essential
  g++
  libcairo2-dev
  libcairo2-dev
  libgif-dev
  libjpeg8-dev
  libpango1.0-dev
  pkg-config

  imagemagick
  git
  texlive-full
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

  npm install -g gulp bower
}

install_packages() {
  apt-get update
  apt-get -y install ${packages[@]}
}

create_user() {
  useradd multilatex 2>/dev/null
  touch /var/log/multilatex
  chown multilatex:multilatex /var/log/multilatex
}

main $@
