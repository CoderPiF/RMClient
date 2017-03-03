#!/bin/bash
cd $2
URL=https://github.com/CoderPiF/RMClient/archive/$1.tar.gz
curl -f -L -- $URL > new.tar.gz
tar -xzf new.tar.gz
rm new.tar.gz
cp Data/NewVersion Version
