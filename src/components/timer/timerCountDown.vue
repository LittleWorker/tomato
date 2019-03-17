<template>
  <div class="count-down">
    <span>{{ `${min}${seperator}${sec}` }}</span>
    <div class="count-down-progress">
      <el-progress :percentage="progressPercent"
                   :stroke-width="20"
                   :show-text="false"></el-progress>
    </div>
  </div>
</template>

<script>
import { sec2MinSec } from '@/utils/time.js'
var intervalId

export default {
  name: 'TimerCountDown',
  props: {
    time: {
      type: [Number, String],
      default: 25
    },
    seperator: {
      type: String,
      default: ':'
    },
    showProgress: {
      type: Boolean,
      default: true
    }
  },
  data() {
    return {
      min: '00',
      sec: '00',
      timeLeft: 0,
      progressPercent: 100
    }
  },
  mounted() {},
  methods: {
    initTimer() {
      this.min = this.atLeastTwoDigit(this.time)
      this.sec = '00'
      this.timeLeft = this.time * 60
    },
    stopTimer() {
      clearInterval(intervalId)
    },
    startTimer() {
      this.initTimer()

      intervalId = setInterval(() => {
        if (this.timeLeft < 0) {
          clearInterval(intervalId)
          this.timeOut()
        } else {
          this.timeLeft--
          //更新min 和 sec
          ;[this.min, this.sec] = sec2MinSec(this.timeLeft)
          this.min = this.atLeastTwoDigit(this.min)
          this.sec = this.atLeastTwoDigit(this.sec)
          //处理进度条进度
          if (this.time == 0) {
            this.progressPercent = 0
          } else {
            this.progressPercent = (this.timeLeft / (this.time * 60)) * 100
          }
        }
      }, 1000)
    },
    timeOut() {
      this.$emit('time-out')
    },
    atLeastTwoDigit(data) {
      if (data < 10) {
        data = '0' + data
      } else {
        data = '' + data
      }
      return data
    }
  },
  watch: {
    time(newVal, oldVal) {
      this.initTimer()
    }
  },
  beforeDestroy() {
    //优化，销毁定时器，避免内存泄漏
    clearInterval(intervalId)
  }
}
</script>

<style lang="scss">
.count-down {
  text-align: center;
  font-size: 0;
  span {
    font-size: 120px;
    color: #3c8cff;
  }
  .el-progress__text {
    display: none;
  }
}
</style>
