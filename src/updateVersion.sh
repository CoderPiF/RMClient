#!/bin/bash
cd "$2"
URL=https://github.com/CoderPiF/RMClient/archive/$1.tar.gz
curl -f -L -- $URL > new.tar.gz
tar -xzf new.tar.gz
rm new.tar.gz

moveDir() {
    target=$1
    path=$2
    for file in $path/*
    do
        targetPath=${file/${target}\//}
        if [ ${targetPath} = "RMClient.alfredworkflow" ]; then
            continue
        fi

        if [ -f  $file ]; then
            mv $file $targetPath
        fi
        if [ -d $file  ]; then
            if [ ! -d $targetPath ]; then
                mkdir $targetPath
            fi
            moveDir $target $file
        fi
    done
}

OriginPack=RMClient-$1
if [ -e ${OriginPack} ]; then
    moveDir ${OriginPack} ${OriginPack}
    rm -r ${OriginPack}
fi
