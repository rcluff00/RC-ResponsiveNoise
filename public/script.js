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
      console.log(response)
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
    .then(function (response) {
      console.log(response)
    })
    .catch(function (error) {
      console.log(error)
    })

  refreshLogs()
  $('#logBodyInput').val('')
}

// creat unique id
function createUUID() {
  return 'xxxxxxx'.replace(/[xy]/g, function (c) {
    var r = (Math.random() * 16) | 0,
      v = c == 'x' ? r : (r & 0x3) | 0x8
    return v.toString(16)
  })
}
