hostname="{{hostname}}"
work="{{work}}"
src="{{src}}"

rsync -a --del $src $hostname:$work

ssh $hostname <<-END
  sudo node $work/tools/ml install
END
