hostname=$1
work=$2
src=$3

rsync -a --del --exclude .git $src $hostname:$work/..

ssh $hostname <<-END
  grunt --gruntfile $work/Gruntfile.js build
  sudo grunt --gruntfile $work/Gruntfile.js install start
END
