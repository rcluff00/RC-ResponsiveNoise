const text2Speech = window.speechSynthesis
const voice2Text = new webkitSpeechRecognition()

voice2Text.onstart = function () {
  $('#vtt').addClass('bg-red-500 hover:bg-red-600')
}

voice2Text.onresult = (event) => {
  $('#logBodyInput').val(`${event.results[0][0].transcript}\n`)
}

voice2Text.onend = function () {
  $('#vtt').removeClass('bg-red-500')
  $('#vtt').removeClass('hover:bg-red-600')
}

$('#vtt').on('click', function () {
  if (voice2Text.speaking) {
    voice2Text.stop()
  } else {
    voice2Text.start()
  }
  $('#vtt').toggleClass('recording')
})

$('#tts').on('click', function () {
  if (text2Speech.speaking) {
    text2Speech.cancel()
    $('#tts')
      .children('img')
      .attr('src', 'https://ryancluff.com/cs4690/img/speaker-icon.png')
    return
  }
  $('#tts')
    .children('img')
    .attr('src', 'https://ryancluff.com/cs4690/img/stop-icon.png')
  let speechStr = ''

  if ($('#logsUl li').length == 0) {
    speechStr = '(No logs recorded)'
  } else {
    $('#logsUl li').each(function ($this) {
      speechStr += 'Time: '
      speechStr += $this.children('small').text() + '\n'

      let logBody = $this.children('pre').text()
      if (logBody === '') {
        speechStr += '(Log empty) \n'
      } else {
        speechStr += 'Log: '
        speechStr += logBody + '\n'
      }
    })
  }
  const utterThis = new SpeechSynthesisUtterance(speechStr)
  text2Speech.speak(utterThis)
  utterThis.addEventListener('end', function () {
    $('#tts')
      .children('img')
      .attr('src', 'https://ryancluff.com/cs4690/img/speaker-icon.png')
  })
})

let $uvuIdInputDiv = $('.uvu-id')
let $uvuIdInput = $('#uvuId')
let $courseInput = $('#course')
let $logsDiv = $('.logs-div')

$logsDiv.css('display', 'none')
refreshCourseSelect()

// EVENT LISTENERS ====================================

$('#logForm').on('submit', function (event) {
  event.preventDefault()
})

$('#submit').on('click', postLog)

$('#btnMask').on('click', function () {
  playSound($('#errorMp3')[0])
})

$uvuIdInput.on('input', checkUvuId)

// show uvuId textbox after course is selected
$courseInput.on('change', () => {
  if ($courseInput[0].selectedIndex != 0) {
    $uvuIdInputDiv.css('display', 'block')
    checkUvuId()
  } else {
    $uvuIdInputDiv.css('display', 'none')
  }
})

// FUNCTION DEFINITIONS ===============================

// check uvuId for proper input
function checkUvuId() {
  uvuId = $uvuIdInput.val()

  if (uvuId.length == 8) {
    refreshLogs()
  }
}

// bing toggle visibility function to logs
function bindEventToLogs() {
  $('#logsUl li').on('click', function () {
    toggleLog($(this))
  })
}

// toggle displaying of log text
function toggleLog($log) {
  logPre = $log.children('pre')
  if (logPre.css('display') != 'none') logPre.css('display', 'none')
  else logPre.css('display', 'block')
}

// replace static course options with options from API
async function refreshCourseSelect() {
  let courseSelect = $('#course')
  let courseOptions = $('#course option:not(:first-child')
  courseOptions.remove()
  let url =
    'https://json-server-5phigi--3000.local.webcontainer.io/api/v1/courses'

  axios
    .get(url)
    .then(function (response) {
      // handle success
      let json = response.data
      for (let i = 0; i < json.length; i++) {
        courseSelect.append(
          `<option value="${json[i].id}">${json[i].display}</option>`
        )
      }
    })
    .catch(function (error) {
      // handle error
      console.log(error)
    })
}

// refresh logs list with current input values
async function refreshLogs() {
  let courseId = $('#course').val()
  let uvuId = $('#uvuId').val()
  let url = `https://json-server-5phigi--3000.local.webcontainer.io/api/v1/logs`

  // fetch log info
  axios
    .get(url, {
      params: {
        courseId: courseId,
        uvuId: uvuId,
      },
    })
    .then(function (response) {
      let json = response.data
      showLogs(json)
    })
    .catch(function (error) {
      // handle error
      console.log(error)
    })
}

// print logs from given data
function showLogs(json) {
  let $logsList = $('#logsUl')

  // clear log list
  $logsList.empty()

  //print log info
  for (log of json) {
    $logsList.append(
      `<li>
        <div><small>${log.date}</small></div>
        <pre><p>${log.text}</p></pre>
      </li>`
    )
  }

  $logsList.children('li').addClass(
    `group
      mb-4
      rounded-r-[1.25rem]
      py-1 px-3
      border-l-2
      border-sky-600
      hover:border-sky-500 hover:cursor-pointer
      hover:bg-slate-100`
  )
  $logsList.children('small').addClass(
    `text-sm
      font-bold
      text-sky-600
      group-hover:text-sky-500`
  )
  $logsList.children('pre').addClass(`whitespace-pre-wrap`)
  $logsDiv.css('display', 'block')

  $('#uvuIdSpan').text(`for ${$uvuIdInput.val()}`)
  bindEventToLogs()

  $('button').attr('disabled', 'false')
  $('#btnMask').css('display', 'none')

  $('#tts').removeClass('hidden')
  $('#vtt').removeClass('hidden')
}

// create new log
function postLog(event) {
  event.preventDefault()
  let d = new Date()
  let date = `${d.getMonth() + 1}/${d.getDate()}/${d.getFullYear()}`
  let amPm = d.getHours() < 12 ? 'AM' : 'PM'
  let time = `${d.getHours()}:${d.getMinutes()}:${d.getSeconds()} ${amPm}`

  let url = 'https://json-server-5phigi--3000.local.webcontainer.io/api/v1/logs'

  axios
    .post(url, {
      courseId: $courseInput.val(),
      uvuId: $uvuIdInput.val(),
      date: `${date}, ${time}`,
      text: $('#logBodyInput').val(),
      id: createUUID(),
    })
    .catch(function (error) {
      console.log(error)
    })

  refreshLogs()
  $('#logBodyInput').val('')

  $('#successMp3')[0].play()
}

function playSound(audio) {
  if ($('button#submit').attr('disabled')) {
    audio.play()
  }
}

// creat unique id
function createUUID() {
  return 'xxxxxxx'.replace(/[xy]/g, function (c) {
    var r = (Math.random() * 16) | 0,
      v = c == 'x' ? r : (r & 0x3) | 0x8
    return v.toString(16)
  })
}
