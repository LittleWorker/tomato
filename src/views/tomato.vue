<template>
  <div class="tomato">
    <div class="tomato-title">
      <p class="tomato-title-h1">Little Worker</p>
      <p class="tomato-title-h2">番茄工作法</p>
    </div>
    <div class="tomato-clock">
      <timer-count-down ref="timer"
                        :time="countTime"
                        @time-out="handleTimeOut"></timer-count-down>
    </div>
    <div class="tomato-control">
      <span class="tomato-control-tip"
            v-show="currentMode != -1">{{ `你需要在 ${startTime}-${endTime} 完成如下事情，加油哦` }}</span>
      <div class="tomato-task-content">
        <input type="text"
               placeholder="请输入任务内容"
               v-model="taskDesc">
      </div>
      <div class="button work-button"
           @click="handleStartWork">开始工作</div>
      <div class="button rest-button"
           @click="handleRestWork">开始休息</div>
      <div class="button stop-button"
           @click="handleStop">停止</div>
    </div>
    <div class="tomato-info">
      <el-button @click="handleTomatoIntroduce"
                 class="tomato-info-button">番茄工作法</el-button>
      <div class="tomato-introduce"
           v-show="showIntroduce">
        <p class="tomato-introduce-title">番茄工作法：最简单有效的时间管理方式</p>
        <ol>
          <li class="tomato-introduce-li">输入一个任务，将番茄时间设为25分钟点【开始工作】</li>
          <li class="tomato-introduce-li">专注工作，中途不允许做任何与该任务无关的事，直到番茄时钟响起</li>
          <li class="tomato-introduce-li">然后短暂休息一下，5分钟左右</li>
        </ol>
        <a class="tomato-introduce-link"
           href="http://baike.baidu.com/view/5259318.htm"
           target="_Blank">详细...</a>
      </div>
      <el-button @click="handleTomatoSetting"
                 class="tomato-info-button">设置</el-button>
      <div class="tomato-setting"
           v-show="showSetting">
        <ul>
          <li class="tomato-setting-li">
            <span>自动循环</span>
            <el-checkbox class="right-box"
                         v-model="autoLoop"
                         @change="handleAutoLoopChange"></el-checkbox>
          </li>
          <li class="tomato-setting-li">
            <span>工作时长</span>
            <input type="text"
                   class="tomato-setting-input"
                   v-model="workUnit">
          </li>
          <li class="tomato-setting-li">
            <span>休息时长</span>
            <input type="text"
                   class="tomato-setting-input"
                   v-model="restUnit">
          </li>
        </ul>
      </div>
      <el-button class="tomato-info-button"
                 @click="handleTomatoRecord">任务记录</el-button>
      <div class="tomato-record-list"
           v-show="showRecordList">
        <el-timeline>
          <el-timeline-item v-for="(item, index) in reversedRecordList"
                            :key="index"
                            :timestamp="getTaskTimeStamp(item)"
                            :color="index == 0?'#409eff':''"
                            placement="top">
            <div class="record-item">
              <span class="break"
                    v-if="item.taskStatus =='break'">{{`任务：【${item.taskDesc}】时间 ${item.startTime} - ${item.endTime} ，但你【停止】于：${item.stopTime}`}}</span>
              <span class="finish"
                    v-else>{{`任务：【${item.taskDesc}】时间 ${item.startTime} - ${item.endTime} ，恭喜你按时完成！`}}</span>
            </div>
          </el-timeline-item>
        </el-timeline>
        <el-button v-show="recordList.length > 0"
                   class="tomato-info-button"
                   type="danger"
                   @click="deleteRecordList">删除记录</el-button>
      </div>
    </div>
  </div>
</template>

<script>
import TimerCountDown from '@/components/timer/timerCountDown'
import { atLeastTwoDigit, getTodayDate } from '@/utils/time.js'
import { isJson } from '@/utils/util.js'

var INITAL_MODE = -1
const WORK_MODE = 0
const REST_MODE = 1
const alertContent = '恭喜你，你又完成了一个番茄任务，继续加油哦^_^！'
const restDesc = '休息，休息一下^_^'

export default {
  name: 'Tomato',
  components: {
    TimerCountDown
  },
  data() {
    return {
      startTime: '',
      endTime: '',
      workUnit: 25,
      restUnit: 5,
      countTime: 0,
      currentMode: INITAL_MODE, // -1--inital 0--work 1--rest
      taskDesc: '',
      showIntroduce: false,
      showSetting: false,
      showRecordList: false,
      recordList: [],
      autoLoop: false
    }
  },
  computed: {
    reversedRecordList() {
      return this.recordList ? this.recordList.reverse() : []
    }
  },
  methods: {
    handleStartWork() {
      if (this.currentMode === INITAL_MODE) {
        if (this.taskDesc == '') {
          window.alert('请输入任务内容')
          return
        }
        this.currentMode = WORK_MODE
        this.countTime = this.workUnit
        //启动倒计时
        this.$refs.timer.startTimer()
        //刷新起始时间
        this.startTime = this.getHourMin()
        this.endTime = this.getHourMin(this.workUnit)
      }
    },
    handleRestWork() {
      if (this.currentMode === INITAL_MODE) {
        this.taskDesc = restDesc
        this.currentMode = REST_MODE
        this.countTime = this.restUnit
        //启动倒计时
        this.$refs.timer.startTimer()
        //刷新起始时间
        this.startTime = this.getHourMin()
        this.endTime = this.getHourMin(this.restUnit)
      }
    },
    handleTimeOut() {
      //将任务记录写入localstorage
      let recordInfo = {
        date: getTodayDate(),
        startTime: this.startTime,
        endTime: this.endTime,
        taskDesc: this.taskDesc,
        taskStatus: 'finish'
      }
      this.setRecordListToLS(recordInfo)
      // 重置当前模式为初始模式
      let currentMode = this.currentMode
      this.currentMode = INITAL_MODE
      //检查是否设置了自动循环
      if (this.autoLoop) {
        //如果当前是工作模式，则下一个为休息模式；否则当前是休息模式，则下一个为工作模式
        currentMode === WORK_MODE
          ? this.handleRestWork()
          : this.handleStartWork()
      } else {
        // alert弹框提示
        window.alert(alertContent)
      }
    },
    handleStop() {
      if (this.currentMode == INITAL_MODE) {
        return
      }
      this.$refs.timer.stopTimer()
      this.currentMode = INITAL_MODE
      let stopTime = this.getHourMin()
      let recordInfo = {
        date: getTodayDate(),
        startTime: this.startTime,
        endTime: this.endTime,
        stopTime: stopTime,
        taskDesc: this.taskDesc,
        taskStatus: 'break'
      }
      console.log('set to record list: ', recordInfo)
      this.setRecordListToLS(recordInfo)
    },
    getHourMin(minutes = 0) {
      let currentTime = new Date()
      let targetTime = Date.parse(new Date()) + minutes * 60 * 1000
      targetTime = new Date(targetTime)
      let targetHour = atLeastTwoDigit(targetTime.getHours())
      let targetMin = atLeastTwoDigit(targetTime.getMinutes())
      return `${targetHour}:${targetMin}`
    },
    handleTomatoIntroduce() {
      this.showIntroduce = !this.showIntroduce
    },
    handleTomatoSetting() {
      this.showSetting = !this.showSetting
    },
    handleTomatoRecord() {
      this.showRecordList = !this.showRecordList
      if (this.showRecordList) {
        this.getRecordListFromLS()
      }
    },
    handleAutoLoopChange() {},
    getRecordListFromLS() {
      let recordList = localStorage.tomatoData
      if (isJson(recordList)) {
        recordList = JSON.parse(recordList)
      }
      this.recordList = recordList.taskList || []
    },
    setRecordListToLS(recordInfo) {
      this.getRecordListFromLS()
      this.recordList.push(recordInfo)
      localStorage.setItem(
        'tomatoData',
        JSON.stringify({ taskList: this.recordList })
      )
    },
    getTaskTimeStamp(item) {
      return item.date ? item.date : getTodayDate() + ' ' + item.startTime
    },
    deleteRecordList() {
      this.recordList = []
      localStorage.setItem('tomatoData', JSON.stringify({ taskList: [] }))
    }
  },
  mounted() {
    this.countTime = this.workUnit
    if (!localStorage.tomatoData) {
      try {
        localStorage.setItem('tomatoData', JSON.stringify({ taskList: [] }))
      } catch (error) {
        console.log('get localStorage error : ', error)
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.tomato {
  position: relative;
  margin: auto;
  width: 40%;
  height: 100%;
  text-align: center;
  &-title {
    width: 100%;
    text-align: center;
    padding-top: 36px;
    padding-bottom: 36px;
    color: rgb(102, 102, 102);
    &-h1 {
      margin: 0;
      padding-bottom: 30px;
      font-size: 50px;
      font-weight: normal;
    }
    &-h2 {
      margin: 0;
      font-size: 20px;
    }
  }
  &-control {
    margin-top: 20px;
    &-tip {
      display: inline-block;
      margin-top: -20px;
      font-size: 16px;
      padding: 16px;
      color: rgb(102, 102, 102);
    }
    .tomato-task-content {
      margin: auto;
      width: 440px;
      border-radius: 4px;
      input {
        width: 100%;
        height: 40px;
        text-align: center;
        font-size: 18px;
        padding: 10px;
      }
    }
    .button {
      display: flex;
      flex-direction: column;
      justify-content: center;
      text-align: center;
      margin: 16px auto;
      border-radius: 4px;
      color: white;
      cursor: pointer;
    }
    .work-button {
      width: 200px;
      height: 50px;
      background-color: #0044cc;
    }
    .rest-button {
      width: 150px;
      height: 40px;
      background-color: #f89406;
    }
    .stop-button {
      width: 100px;
      height: 28px;
      background-color: #da4f49;
    }
  }
  &-info {
    margin-top: 32px;
    text-align: left;
    &-button {
      margin-right: 16px;
    }
    .tomato-introduce {
      padding-left: 16px;
      padding-bottom: 8px;
      font-size: 16px;
      color: rgb(102, 102, 102);
      &-li {
        margin-bottom: 8px;
      }
    }
    .tomato-setting {
      ul {
        list-style: none;
        padding-left: 16px;
        li {
          margin: 8px 0px;
          vertical-align: middle;
          span {
            margin-right: 16px;
          }
          input {
            width: 72px;
            padding: 4px 8px;
          }
        }
      }
    }
    .tomato-record-list {
      padding-left: 16px;
      ul {
        list-style: none;
        padding-left: 0px;
        margin-top: 24px;
        .record-item {
          span {
            display: block;
            padding: 8px 16px;
            margin-bottom: 20px;
            border-radius: 4px;
          }

          .break {
            color: #b94a48;
            background-color: #f2dede;
            border-color: #eed3d7;
          }
          .finish {
            color: #3a87ad;
            background-color: #d9edf7;
            border-color: #bce8f1;
          }
        }
      }
    }
  }
}
</style>

