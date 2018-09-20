"use strict"

const ffmpeg = require('./index')
const util = require('util')

let mp4="/Users/lijian/code/node/git.liebaopay.com/yuli/liff/3.mp4"
let ti = "00:00:05"
let screen = "540x960"

// ffmpeg.Info(mp4).then((info)=>{
//     console.log(info)
// },()=>{})

// ffmpeg.ScreenshotOnce(mp4,ti,screen,'/Users/lijian/code/node/git.liebaopay.com/yuli/liff/4.jpg').then((image)=>{
//     console.log(image)
// },(err)=>{
//     console.log(err)
// })

// ffmpeg.ScreenshotOnce(mp4,ti,screen).then((image)=>{
//     console.log(image)
// },(err)=>{
//     console.log(err)
// })

ffmpeg.ScreenshotArr(mp4,["00:00:05.000","00:00:05.200","00:00:05.400"],screen).then((images)=>{
    console.log(images)
})