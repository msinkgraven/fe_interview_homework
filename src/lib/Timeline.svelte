<style lang="postcss">
</style>

<main class="h-screen w-fit absolute">
    <!-- Head -->
    <!-- Scheduler -->
    <div id="schedule" class="flex overflow-scroll relative pt-6 h-full w-full">
        <!-- Swim lane -->
        <div id="swimlane" class="absolute p-4 w-full z-0 top-[96px] { rows.length ? 'bg-gray-500/10' : ''}">
            <!-- <div id="swimlane" class="relative inline-block p-2 bg-slate-400/20 h-{12 * rows.length} w-full top-20 pointer-events-none"> -->
            {#each rows as row, r}
            <div id="task-row-{r}" class="h-10">
                {#each row as task}
                <TaskComponent bind:task={task} row="{r}" />
                {/each}
            </div>
            {/each}
            <!-- </div> -->
        </div>
        {#each days as day}
        <!-- For the first day of the month add month -->
        {#if new Date(day).getDate() == 1}
        <div class="text-center sticky left-3">
            <span class="bg-white text-xs text-purple-800 font-bold uppercase pr-5 pl-2 absolute top-[-1rem]">{getMonthFormat(day)}</span>
        </div>
        {/if}
        <div class="overflow-hidden">
            <!-- Date header -->
            <div class="min-w-14 max-w-14 py-1 flex justify-center select-none { getDayFormat(day)[0] == 'S' ? 'text-gray-400' : '' }">
                <span class="text-sm py-1 px-2 w-full text-center rounded { isToday(day) ? 'bg-orange-500 text-white font-bold' : '' }">{getDayFormat(day)}</span>
            </div>
            <!-- Day columns -->
            <div id="day-col-{getDateId(day)}" role="presentation" class="z-10 pt-4 z-2 border-r border-t h-full border-gray-600/10 min-w-14 max-w-14 flex flex-col select-none  { getDayFormat(day)[0] == 'S' ? 'bg-gray-400/10' : '' } { isToday(day) ? 'bg-orange-500/10' : '' }"
                on:dragover={handleDragOver}
                on:drop={handleDrop}
                on:dragleave={handleDragLeave}
                >
            </div>
        </div>
        {/each}
    </div>

    {#if authError}
    <div class="fixed top-0 left-0 h-screen w-screen bg-gray-800/50 flex justify-center align-middle">
        <!-- Modal to prompt for auth token -->
        <div class="w-1/2 flex flex-col justify-center" id="modal">
            <div class="bg-white rounded p-6">
                <h2 class="text-2xl font-bold text-slate-700 mb-4">Enter your Toggl auth details</h2>
                <p class="text-slate-700">Auth token</p>
                <input type="text" value="{authToken}" id="api-token" class="text-slate-500 mb-2 w-full p-2 border border-gray-300 rounded" />
                <p class="text-slate-700">Workspace id</p>
                <input type="text" value="{workspaceId}" id="workspace-id" class="text-slate-500 mb-2 w-full p-2 border border-gray-300 rounded" />
                <p class="text-slate-700">Team id</p>
                <input type="text" value="{teamId}" id="team-id" class="text-slate-500 mb-2 w-full p-2 border border-gray-300 rounded" />
                <button class="px-6 py-2 rounded bg-purple-500 text-white" on:click={handleTokenSubmit}>Submit</button>
            </div>
        </div>
    </div>
    {/if}

</main>

<svelte:window on:mouseup={mouseupListener} />

<script lang="ts">
import {
    onMount,
    tick
} from 'svelte';
import {
    fetchData
} from '../api/api';

import moment from 'moment';

import TaskComponent from './Task.svelte';

// Date range to display
const since = moment().subtract(21, 'days').format('YYYY-MM-DD');
const until = moment().add(100, 'days').format('YYYY-MM-DD');

// Days to display
let days: string[] = [];
// Tasks to display
let tasks: Task[] = [];
// Rows where the tasks will be displayed
let rows: Array < Task[] > = [];
// If there is an error with the auth token
let authError: boolean = false;
// Toggl workspace and team id
let workspaceId: string = '733581';
let teamId: string = '716316';
let authToken: string | null;

// Highlight the day column when dragging over
const handleDragOver = (event: DragEvent) => {
    event.preventDefault();

    const targetElement = event.target as HTMLElement;

    // ensure to only apply the background color to the day column
    if (targetElement.id.indexOf('day-') === 0) {
        targetElement.classList.add('bg-blue-400/10');
    }
};

// Remove the highlight when dragging out of the day column
const handleDragLeave = (event: DragEvent) => {
    event.preventDefault();
    const targetElement = event.target as HTMLElement;
    targetElement.classList.remove('bg-blue-400/10');
};

// Handle the drop event
const handleDrop = (event: DragEvent) => {
    event.preventDefault();
    const targetElement = event.target as HTMLElement;
    targetElement.classList.remove('bg-blue-400/10');

    if (event.dataTransfer) {
        // get the task id from the dataTransfer
        const taskId = event.dataTransfer.getData('text/plain');
        // get the date from the id
        const date = targetElement.id.replace('day-col-', '');
        // get the task from the task array and update the start date
        const taskIndex = tasks.findIndex((task) => task.id === Number(taskId));
        // Calculate the difference in days between the new start date and the old start date
        const diff = moment(date).diff(moment(tasks[taskIndex].start_date), 'days');

        // Add the difference to the start date
        tasks[taskIndex].start_date = date;
        tasks[taskIndex].end_date = moment(tasks[taskIndex].end_date).add(diff, 'days').format('YYYY-MM-DD');
    }

    // move the swimlane back to the front
    const swimlane = document.getElementById('swimlane');
    if (swimlane !== null) {
        swimlane.style.zIndex = '1';
    }

    // refresh the tasks
    refreshTasks();
};

// Listen for the resize event
const mouseupListener = () => {
    // move the swimlane back to the front
    const swimlane = document.getElementById('swimlane');
    if (swimlane !== null) {
        swimlane.style.zIndex = '1';
    }
    refreshTasks();
};

/**
 * Order the tasks based on the start and end date
 * @param Task[] tasksToOrder
 * @returns {Array<Task[]>}
 */
const orderTasks = (tasksToOrder: Task[]) => {
    // Order events based on weight
    const sortedTasks: Task[] = tasksToOrder.toSorted((a, b) => {
        return a.weight - b.weight;
    });

    // Create an array of arrays to hold the tasks in the rows
    const taskRows: Array < Task[] > = tasksToOrder.map((_) => []);

    // loop through the sorted tasks and check if there is space in the highest row, if not, check the next row untill there is space
    sortedTasks.forEach((task) => {
        let row = 0;
        let added = false;
        while (!added) {
            // space available is when the dates of the tasks in the row do not overlap with the current task
            const available = !taskRows[row].some((t) => hasOverlap(t, task));

            if (available) {
                taskRows[row].push(task);
                added = true;
            } else {
                row += 1;
            }
        }
    });

    // Remove empty rows and return the rows
    return taskRows.filter((i) => i.length);
};

/**
 * Check if two tasks overlap
 * @param task1
 * @param task2
 *
 * @returns {boolean}
 */
const hasOverlap = (task1: Task, task2: Task) => {
    return moment(task1.start_date).isBetween(task2.start_date, task2.end_date, undefined, '[]') ||
        moment(task1.end_date).isBetween(task2.start_date, task2.end_date, undefined, '[]') ||
        moment(task2.start_date).isBetween(task1.start_date, task1.end_date, undefined, '[]') ||
        moment(task2.end_date).isBetween(task1.start_date, task1.end_date, undefined, '[]');
};

const refreshTasks = async () => {
    // Force an update
    tasks = [...tasks];

    tick().then(() => {
        rows = orderTasks(tasks);
    });
};

const addTask = (task: Task) => {
    tasks = [...tasks, task];
};

// Return the first letter of the day and the day number
const getDayFormat = (date: string) => {
    return moment(date).format('dd')[0] + moment(date).format('D');
};

const getMonthFormat = (date: string) => {
    return moment(date).format('MMMM');
};

const isToday = (date: string) => {
    const today = moment();
    return today.isSame(date, "day");
};

// Return date in the format of YYYY-MM-DD
const getDateId = (date: string) => {
    return moment(date).format('YYYY-MM-DD');
};

// Populate the days array with the dates from since to until
for (let i = new Date(since); i <= new Date(until); i.setDate(i.getDate() + 1)) {
    days.push(new Date(i).toISOString());
}

// Handle the token submit
const handleTokenSubmit = () => {
    const token = (document.getElementById('api-token') as HTMLInputElement).value;
    workspaceId = (document.getElementById('workspace-id') as HTMLInputElement).value;
    teamId = (document.getElementById('team-id') as HTMLInputElement).value;

    if (token && workspaceId && teamId) {
        localStorage.setItem('token', token);
        authError = false;
        tick().then(() => {
            initializeTasks();
        });
    }
};

const initializeTasks = async () => {
    const endpoint = `https://api.plan.toggl.space/api/v6-rc1/${workspaceId}/tasks?since=${since}&until=${until}&short=true&team=${teamId}`;

    // Get the auth token from the local storage
    authToken = localStorage.getItem('token');

    // If there is no auth token, prompt the user to enter the auth token, workspace id and team id
    if (!authToken) {
        authError = true;
        return;
    }

    await fetchData(endpoint, 'GET', authToken)
        .then((response) => {
            if (!response.success) {
                throw new Error('Error fetching tasks');
            }
            response.data.forEach((task: Task) => {
                addTask(task);
            });
        }).catch((error) => {
            authError = true;
            console.error(error);
        });

    rows = orderTasks(tasks);
};

onMount(async () => {
    initializeTasks();
});
</script>
