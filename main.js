const STORAGE_KEY = 'todos';

// Loaded from localStorage on start, saved back on every render
// 시작 시 localStorage에서 불러오고, 렌더링할 때마다 저장
let todos = [];
let nextId = 1;
// Current filter: 'all' | 'active' | 'completed'
// 현재 필터: 'all'(전체) | 'active'(진행중) | 'completed'(완료)
let currentFilter = 'all';

const EMPTY_MESSAGES = {
  all: '할 일이 없습니다',
  active: '진행중인 할 일이 없습니다',
  completed: '완료된 할 일이 없습니다',
};

let form;
let input;
let list;
let countTotal;
let countDone;
let emptyMsg;
let filterBtns;
let clearBtn;

function initApp() {
  form = document.querySelector('.todo-form');
  input = document.querySelector('.todo-input');
  list = document.querySelector('.todo-list');
  countTotal = document.querySelector('.count-total');
  countDone = document.querySelector('.count-done');
  emptyMsg = document.querySelector('.empty');
  filterBtns = document.querySelectorAll('.filter-btn');
  clearBtn = document.querySelector('.clear-btn');

  loadTodos();

  // submit covers both the add button click and the Enter key
  // submit 이벤트 하나로 추가 버튼 클릭과 Enter 키를 모두 처리
  form.addEventListener('submit', handleSubmit);
  filterBtns.forEach((btn) => {
    btn.addEventListener('click', () => setFilter(btn.dataset.filter));
  });
  clearBtn.addEventListener('click', clearCompleted);

  render();
}

function loadTodos() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (Array.isArray(saved)) todos = saved;
  } catch {
    // Missing, corrupted, or blocked storage: start with an empty list
    // 저장값이 없거나 손상됐거나 접근이 막힌 경우 빈 목록으로 시작
    todos = [];
  }
  nextId = todos.reduce((max, t) => Math.max(max, t.id), 0) + 1;
}

function saveTodos() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
  } catch {
    // Storage full or blocked: keep working in memory
    // 저장 공간 부족 또는 차단 시 메모리로만 동작
  }
}

function handleSubmit(event) {
  event.preventDefault();

  const text = input.value.trim();
  if (!text) {
    alert('할 일을 입력하세요');
    input.focus();
    return;
  }

  if (todos.some((t) => t.text === text)) {
    alert('이미 등록된 할 일입니다');
    input.focus();
    return;
  }

  todos.push({ id: nextId++, text, completed: false });
  input.value = '';
  input.focus();
  render();
}

function toggleTodo(id) {
  const todo = todos.find((t) => t.id === id);
  if (todo) todo.completed = !todo.completed;
  render();
}

function deleteTodo(id) {
  todos = todos.filter((t) => t.id !== id);
  render();
}

function clearCompleted() {
  todos = todos.filter((t) => !t.completed);
  render();
}

function setFilter(filter) {
  currentFilter = filter;
  render();
}

function getVisibleTodos() {
  if (currentFilter === 'active') return todos.filter((t) => !t.completed);
  if (currentFilter === 'completed') return todos.filter((t) => t.completed);
  return todos;
}

function createTodoItem(todo) {
  const li = document.createElement('li');
  li.className = 'todo-item';
  if (todo.completed) li.classList.add('completed');

  const checkbox = document.createElement('input');
  checkbox.type = 'checkbox';
  checkbox.checked = todo.completed;
  checkbox.setAttribute('aria-label', '완료');
  checkbox.addEventListener('change', () => toggleTodo(todo.id));

  // textContent so user input is never parsed as HTML
  // 입력값이 HTML로 해석되지 않도록 textContent 사용
  const span = document.createElement('span');
  span.className = 'todo-text';
  span.textContent = todo.text;

  const deleteBtn = document.createElement('button');
  deleteBtn.type = 'button';
  deleteBtn.className = 'delete-btn';
  deleteBtn.textContent = '삭제';
  deleteBtn.addEventListener('click', () => deleteTodo(todo.id));

  li.append(checkbox, span, deleteBtn);
  return li;
}

function render() {
  // replaceChildren leaves the <ul> truly empty when there are no todos,
  // so the CSS :empty rule shows the empty-state message
  // 할 일이 없으면 <ul>이 완전히 비어 CSS :empty로 안내 문구가 표시됨
  list.replaceChildren(...getVisibleTodos().map(createTodoItem));
  emptyMsg.textContent = EMPTY_MESSAGES[currentFilter];

  // Highlight the selected filter
  // 선택된 필터 강조
  filterBtns.forEach((btn) => {
    const selected = btn.dataset.filter === currentFilter;
    btn.classList.toggle('active', selected);
    btn.setAttribute('aria-pressed', selected);
  });

  const doneCount = todos.filter((t) => t.completed).length;
  countTotal.textContent = todos.length;
  countDone.textContent = doneCount;
  clearBtn.disabled = doneCount === 0;

  // Every add/toggle/delete ends in render(), so saving here covers them all
  // 추가/완료/삭제 모두 render()로 끝나므로 여기서 한 번에 저장
  saveTodos();
}

document.addEventListener('DOMContentLoaded', initApp);
