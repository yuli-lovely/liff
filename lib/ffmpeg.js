"use strict"

const fs = require('fs')
const child_process = require('child_process')
const path = require('path')

// _screenshotArr 截图数组
// params:
//  video: /data/1/2/3/abc.mp4
//  time: [00:00:01.100,00:00:01.200,00:00:01.400]
//  screen: 540x960
//  images: [/data/1/2/3/abc0.jpg,/data/1/2/3/abc1.jpg,/data/1/2/3/abc2.jpg]
// return:
//  image
const _screenshotArr = (video, times, screen, images) => {
  return new Promise((resolve, reject) => {
    fs.exists(video, (ok) => {
      if (!ok) {
        reject(`video:"${video}" 文件不存在`)
        return
      }
      images = images || []
      if (images.length == 0) {
        for (let i = 0; i < times.length; i++) {
          images.push(path.dirname(video) + '/' + path.basename(video).replace(path.extname(video), i + '.jpg'))
        }
      }
      _screenshot(video, times, screen, images, times.length).then((imgs) => {
        imgs.reverse()
        resolve(imgs)
      })
    })
  })
}
//不在本地视频的裁剪

const _screenshotArrOut = (video,pat, times, screen, images) => {
  return new Promise((resolve, reject) => {
    // fs.exists(video, (ok) => {
    //   if (!ok) {
    //     reject(`video:"${video}" 文件不存在`)
    //     return
    //   }
      images = images || []
      if (images.length == 0) {
        for (let i = 0; i < times.length; i++) {
          images.push(pat+ path.basename(video).replace(path.extname(video), i + '.jpg'))
        }
      }
      _screenshot(video, times, screen, images, times.length).then((imgs) => {
        imgs.reverse()
        resolve(imgs)
      })
    // })
  })
}

// _screenshotOnce 截图
// params:
//  video: /data/1/2/3/abc.mp4
//  time: 00:00:01
//  screen: 540x960
// return:
//  image
const _screenshotOnce = (video, time, screen, image) => {
  return new Promise((resolve, reject) => {
    fs.exists(video, (ok) => {
      if (!ok) {
        reject(`video:"${video}" 文件不存在`)
        return
      }
      image = image || path.dirname(video) + '/' + path.basename(video).replace(path.extname(video), '.jpg')
      _screenshot(video, [time], screen, [image], 1).then((imgs) => {
        resolve(imgs[0])
      })
    })
  })
}

// _screenshot 循环截图
const _screenshot = (video, times, screen, images, max) => {
  return new Promise((resolve) => {
    let arrImage = []
    let cmd = `ffmpeg -i "${video}" -s "${screen}" -y -f image2 -ss "${times[max-1]}" -frames 1 "${images[max-1]}"`
    child_process.exec(cmd, function (err, stdout, stderr) {
      let image = ""
      let arr = stderr.split("\n")
      for (let v in arr) {
        let substr = arr[v].match(/Output #0, image2, to '([\s\S]+)':/)
        if (substr) {
          image = substr[1]
        }
      }
      arrImage.push(image)
      
      max--
      if (max == 0) {
        return resolve(arrImage)
      }
      _screenshot(video, times, screen, images, max).then((imgs) => {
        for (let i = 0; i < imgs.length; i++) {
          arrImage.push(imgs[i])
        }
        return resolve(arrImage)
      })
    })
  })
}

// _info 截图
// params:
//  video: /data/1/2/3/abc.mp4
const _info = (video) => {
  return new Promise((resolve, reject) => {
    fs.exists(video, (ok) => {
      if (!ok) {
        reject(`video:"${video}" 文件不存在`)
        return
      }
      let cmd = `ffmpeg -i "${video}" `
      child_process.exec(cmd, function (err, stdout, stderr) {
        let arr = stderr.split("\n")
        let duration = ""
        let start = ""
        let bitrate = ""
        let video = ""
        let audio = ""
        let videoScreen = ""
        let audioSampleRate = ""
        for (let v in arr) {
          let substr = ""
          substr = arr[v].match(/Duration: ([\s\S]+), start: ([\s\S]+), bitrate: ([\s\S]+)/)
          if (substr) {
            duration = substr[1]
            start = substr[2]
            bitrate = substr[3]
          }
          substr = arr[v].match(/Video: ([\s\S]+)/)
          if (substr) {
            video = substr[1]
          }
          substr = arr[v].match(/Audio: ([\s\S]+)/)
          if (substr) {
            audio = substr[1]
          }
        }

        try {
          videoScreen = video.split(",")[2].split(" ")[1]
        } catch (e) {
          reject(`video:"${video}" 视频分辨率识别失败`)
          return
        }
        try {
          audioSampleRate = audio.split(",")[1].split(" ")[1]
        } catch (e) {
          reject(`video:"${video}" 音频采样率识别失败`)
          return
        }
        resolve({
          duration: duration,
          start: start,
          bitrate: bitrate,
          video: video,
          audio: audio,
          videoScreen: videoScreen,
          audioSampleRate: audioSampleRate,
        });
        return
      })
    })
  })
}


module.exports = {
  name: 'ffmpeg',
  Info: _info,
  ScreenshotOnce: _screenshotOnce,
  ScreenshotArr: _screenshotArr,
  ScreenshotArrOut:_screenshotArrOut
}