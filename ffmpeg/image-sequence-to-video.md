# Turn an image sequence into a video

Assuming we have a directory of images names `0000.png`, `0001.png` etc, the following
will turn that into `output.mp4`:

```
ffmpeg -r 24 -f image2 -s 1080x1080 -i %04d.png -vcodec libx264 -crf 15 -pix_fmt yuv420p output.mp4
```


 - `-s 1080x1080` - the image resolution
 - `-r 24` - the desired frame rate
 - `-crf 15` -  0–51, where 0 is lossless, 23 is the default, and 51 is worst quality possible
