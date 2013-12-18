name="{{username}}"
home="{{home}}"
logs="{{logs}}"
heads="{{heads}}"
install="{{install}}"
src="{{src}}"

useradd -d $home $name

mkdir -p $home
chown $name:$name $home

mkdir -p $logs
chown $name:$name $logs

mkdir -p $heads
chown $name:$name $heads

mkdir -p $install
chown $name:$name $install

stop multilatex
su -c "rsync -a --del $src $install" multilatex
start multilatex
