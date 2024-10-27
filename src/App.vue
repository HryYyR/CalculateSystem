<template>
  <div class="container" ref="container">
    <div class="box" v-show="!data.islogin">
      <!-- 滑动盒子 -->
      <div class="pre-box" :style="{ transform: transformValue, backgroundColor: backgroundColor }">
        <h1>WELCOME</h1>
        <p>口算练习系统</p>
        <div class="img-box">
          <img src="./assets/1.jpg" alt="" />
        </div>
      </div>

      <!-- 注册盒子 -->
      <div class="register-form">
        <div class="title-box">
          <h1>注册</h1>
        </div>
        <div class="input-box">
          <input type="text" placeholder="用户名" />
          <input type="password" placeholder="密码" />
          <input type="password" placeholder="确认密码" />
        </div>
        <div class="btn-box">
          <button @click="register">注册</button>
          <p @click="mySwitch">已有账号?去登录</p>
        </div>
      </div>

      <!-- 登录盒子 -->
      <div class="login-form">
        <div class="title-box">
          <h1>登录</h1>
        </div>
        <div class="input-box">
          <input v-model="data.username" type="text" placeholder="用户名" />
          <input v-model="data.password" type="password" placeholder="密码" />
        </div>
        <div class="btn-box">
          <button @click="login">登录</button>
          <p @click="mySwitch">没有账号?去注册</p>
        </div>
      </div>
    </div>



    <div class="app" v-if="data.islogin">
      <h1>口算练习系统</h1>
      <p v-show="data.remaintime > 0&& data.status == 0">剩余时间: {{ data.remaintime }}秒</p>
      <div v-show="data.status == -1" class="selectoption">
        <p>题目难度: <el-select v-model="data.difficult" placeholder="Select" size="large" style="width: 240px">
            <el-option v-for="item in data.difficultlist" :key="item.value" :label="item.label" :value="item.value" />
          </el-select></p>
        <p>
          题目数量: <el-select v-model="data.topiccount" placeholder="Select" size="large" style="width: 240px">
            <el-option v-for="item in data.topiccountlist" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
        </p>
        <el-button type="primary" size="default" @click="start">开始练习</el-button>

      </div>

      <div v-show="data.status == 0" class="dotest">
        <div class="topic_container">
          <div v-for="(item, index) in data.topic.list" :key="index">
            <div v-if="index == data.index"> {{ `${item.left} ${item.operation
              ? '+' : '-'} ${item.right} = ?` }} </div>
          </div>
        </div>
        <el-input ref="useransref" v-model="data.useranswer" style="width: 300px">
          <template #prepend>Answer: </template>
        </el-input>
        <div>
          <el-button v-show="data.index != 0" type="primary" size="default"
            @click="() => { data.index--; data.useranswer = JSON.stringify(data.topic.list[data.index].user_answer) }">上一题</el-button>
          <el-button type="primary" size="default" @click="submit">{{ data.index + 1 ==
            data.topiccount ? '提交' : '下一题' }}</el-button>
        </div>
        <span> ({{ data.index + 1 }}/{{ data.topiccount }})</span>
      </div>

      <div v-show="data.status == 1" class="result">
        <p>题数:{{ data.ans.topic_count }}</p>
        <p>正确数:{{ data.ans.CorrectAmount }}</p>
        <p>正确率:{{ data.ans.Correctness }}%</p>
        <el-button type="primary" size="default" @click="restart">再来一次</el-button>
      </div>

    </div>

  </div>
</template>

<script setup>
import { reactive, onMounted ,onUnmounted} from "vue"
import { loginapi, getlistapi, submitlistapi } from './api/api'
import { ElMessage } from 'element-plus';
import { ref } from 'vue'

// 定义状态
const container = ref(null)
const useransref = ref(null)
const flag = ref(true)
const transformValue = ref('translateX(0%)')
const backgroundColor = ref('#edd4dc')
const imageSrc = ref('@/assets/1.jpg')

// 切换状态函数
const mySwitch = () => {
  if (flag.value) {
    transformValue.value = 'translateX(100%)'
    backgroundColor.value = '#c9e0ed'
    imageSrc.value = '@/assets/2.jpg'
  } else {
    transformValue.value = 'translateX(0%)'
    backgroundColor.value = '#edd4dc'
    imageSrc.value = '@/assets/1.jpg'
  }
  flag.value = !flag.value
}

const data = reactive({
  userdata: {
    userid: 0,
    username: ""
  },
  username: "",
  password: "",
  topic: {
    list: [],
    topic_count: 0,
    start_time: "",
    end_time: "",
  },
  remaintime: 0,
  status: -1,
  islogin: false,
  index: 0,
  useranswer: "",
  difficult: 10,
  difficultlist: [
    {
      label: "简单",
      value: 10
    },
    {
      label: "普通",
      value: 50
    },
    {
      label: "困难",
      value: 100
    },
  ],
  topiccount: 10,
  topiccountlist: [
    {
      label: "10",
      value: 10
    },
    {
      label: "30",
      value: 30
    },
    {
      label: "50",
      value: 50
    },
    {
      label: "100",
      value: 100
    },
  ],
  ans: {

  }
})

onMounted(() => {
  window.addEventListener("keydown", submittopic)
})

onUnmounted(()=>{
  window.removeEventListener("keydown", submittopic)
})

const submittopic = (e) => {
  if (e.key == "Enter") {
    if (!data.islogin) {
      login()
      return
    }
    if (data.status == -1) {
      start()
      return
    }
    if (data.status ==0) {
      submit()
      return
    }
    if (data.status ==1) {
      restart()
      return
    }
  }
}


const login = async () => {
  try {
    let res = await loginapi(data.username, data.password)
    if (res.status == 200) {
      data.islogin = true
      console.log(res.data);
      data.userdata = res.data.data
    }
  } catch (error) {
    ElMessage.error("账号密码错误!")
  }

}

const register = () => {

}

const getlist = async () => {
  try {
    let res = await getlistapi(data.topiccount, data.difficult, data.userdata.userid, data.userdata.username)
    if (res.status == 200) {
      data.topic = res.data.data
    }
  } catch (e) {
    ElMessage.error("获取题目失败!")
  }

}

const submit = async () => {
  useransref.value.focus()
  if (data.useranswer.trim().length == 0) {
    ElMessage.error("输入答案不能为空!")
    return
  }
  try {
    let check = JSON.parse(data.useranswer.trim())
  } catch (error) {
    ElMessage.error("输入答案只能为数字!")
    return
  }

  data.topic.list[data.index].user_answer = JSON.parse(data.useranswer)
  data.topic.list[data.index].ok = JSON.parse(data.useranswer) == data.topic.list[data.index].answer
  data.index++

  if (data.index >= data.topic.topic_count) {
    let res = await submitlistapi(data.topic)
    data.ans = res.data.data
    data.status = 1
  }

  if (data.topic.list[data.index]) {
    if (data.topic.list[data.index].user_answer == 0 || data.topic.list[data.index].user_answer.length == 0) {
      data.useranswer = ""
    } else {
      data.useranswer = JSON.stringify(data.topic.list[data.index].user_answer)
    }
  }


}

const restart = () => {
  getlist()
  data.index = 0
  data.status = -1
  data.useranswer = ""
}

const start = async () => {
  getlist()
  let remaintime
  if (data.difficult == 10) {
    remaintime = (data.difficult / 10) * (data.topiccount) * 2
  }
  if (data.difficult == 50) {
    remaintime = (data.difficult / 50) * (data.topiccount) * 3
  }
  if (data.difficult == 100) {
    remaintime = (data.difficult / 100) * (data.topiccount) * 4
  }
  countdown(remaintime, async () => {
    let res = await submitlistapi(data.topic)
    data.ans = res.data.data
    data.status = 1
  });
  data.remaintime = remaintime
  data.status = 0
  useransref.value.focus()

}

function countdown(duration, callback) {
  const interval = setInterval(() => {
    data.remaintime--;
    if (data.remaintime <= 0) {
      clearInterval(interval); // 停止计时器
      callback(); // 调用回调函数
    }
  }, 1000); // 每秒执行一次
}



</script>


<style scoped>
@import url(./App.css);

.login_container {
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
}

.app {
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
}

.app>* {
  margin: 10px 0;
}

.selectoption {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}

.selectoption>* {
  margin: 10px 0;
}

.result {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}

.result>* {
  margin: 10px 0;
}

.dotest {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}

.dotest>* {
  margin: 10px 0;
}

.topic_container {
  height: 20px;
  overflow: hidden;
}
</style>
