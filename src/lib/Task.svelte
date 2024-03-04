<script lang="ts">
import {
    afterUpdate,
    tick
} from 'svelte';

import moment from 'moment';

export let row: number;
export let task: Task;

let resize : Resizeable = {
    id: null,
    offset: 0,
    side: null,
    distanceMoved: 0
};

const dragstartHandler = (event: DragEvent) => {
    if (!event.dataTransfer) {
        return;
    }
    // Set the task id for the dataTransfer
    event.dataTransfer.setData('text/plain', task.id.toString());

    event.dataTransfer.dropEffect = 'move';
    event.dataTransfer.effectAllowed = 'move';

};

// Hide the task when dragging and move the swimlane behind the day columns
const dragHandler = (event: DragEvent) => {
    const targetElement = event.target as HTMLElement;
    targetElement.classList.add('hidden');

    // move the swimlane behind the the day columns so that we can drag the task over the day columns
    const swimlane = document.getElementById('swimlane');
    if (swimlane) {
        swimlane.style.zIndex = '-1';
    }
};

const dragendHandler = (event: DragEvent) => {
    const targetElement = event.target as HTMLElement;
    targetElement.classList.remove('hidden');
};

// Prevent tasks from being dropped into each other
const preventDrop = (event: DragEvent) => {
    event.stopPropagation();
};

// Determine the width based on the number of days
const getWidth = (start_date: string, end_date: string) => {
    const numDays = moment(end_date).diff(moment(start_date), 'days') + 1;

    return `min-w-[${numDays * 3.5}rem] max-w-[${numDays * 3.5}rem]`;
};

// Position the task based on the start date
const positionTask = () => {
    const draggable = document.getElementById(`task-${task.id}`);
    const day = document.getElementById(`day-col-${task.start_date}`);
    const swimlane = document.getElementById('swimlane');

    if (!draggable || !day || !swimlane) {
        return;
    }

    // Get the distance from the left most edge of the swimlane to the left most edge of the day column
    const distance = day.getBoundingClientRect().left - swimlane.getBoundingClientRect().left;

    // Position the element
    draggable.style.position = 'absolute';
    draggable.style.left = `${distance}px`;

    // Append the task to the corrcet row
    const rowElement = document.getElementById(`task-row-${row}`);
    rowElement && rowElement.appendChild(draggable);
};

// Show the estimated minutes per day, calculated to exclude weekends
$: estimatedMinutes = () => {
    let daysToIgnore = 0;
    // if the estimate_skips_weekend, remove the weekends from the number of days
    if (task.estimate_skips_weekend) {
        // calcultate the number of non-week days in the range
        let currentDate = moment(task.start_date);
        while (currentDate.isSameOrBefore(moment(task.end_date))) {
            if (currentDate.day() === 0 || currentDate.day() === 6) {
                daysToIgnore++;
            }
            currentDate = currentDate.add(1, 'days');
        }
    }

    const numDays = moment(task.end_date).diff(moment(task.start_date), 'days') + 1;
    const dailyEstimatedMinutes = Math.round(task.estimated_minutes / (numDays - daysToIgnore));


    // otherwise, return the estimated minutes divided by the number of days
    return `${dailyEstimatedMinutes}m daily`;
};

// Start the resize event
const startResize = (type: string, id: number, event: MouseEvent) => {
    event.preventDefault();

    // Set the offset to the current mouse position
    resize.offset = event.clientX;
    // Set the side to the type
    resize.side = type as "left" | "right" | null;

    // Set the resizeId to the task id so that we can identify the task on stopResize
    resize.id = task.id;
};

const resizeHandler = (event: MouseEvent) => {
    if (resize.id === task.id) {

        resize.distanceMoved = event.clientX - resize.offset;

        // Only apply the resize if the distance moved is greater than 56px in either direction, we dont want to keep applying an update for every small change
        if (resize.distanceMoved > 52 || resize.distanceMoved < -52) {
            applyResize();
            resize.offset = event.clientX;
            resize.distanceMoved = 0;
        }
    }
};

// Reset the resize object when the mouse is released
const stopResize = () => {
    resize.id = null;
    resize.offset = 0;
    resize.side = null;
    resize.distanceMoved = 0;
};

// Apply the resize to the task
const applyResize = () => {
    let numDays = 1;

    // make it posiive or negative based on the distance moved
    if (resize.distanceMoved < 0) {
        numDays *= -1;
    }

    if (resize.side === 'left') {
        // get the day column that the mouse is over
        task.start_date = moment(task.start_date).add(numDays, 'days').format('YYYY-MM-DD');
    } else if (resize.side === 'right') {
        task.end_date = moment(task.end_date).add(numDays, 'days').format('YYYY-MM-DD');
    }

    tick().then(() => {
        positionTask();
    });

};

// Position the task after the component updates
afterUpdate(() => {
    tick().then(() => {
        positionTask();
    });
});
</script>

<svelte:window on:mouseup={stopResize} on:mousemove={resizeHandler} />

<div id="task-{task.id}" draggable="true" on:drag="{dragHandler}" on:dragend="{dragendHandler}" on:dragstart={dragstartHandler} on:drop="{preventDrop}" role="listbox" tabindex="0" aria-dropeffect="move" class="task px-1 mb-1 h-fit pointer-events-auto {getWidth(task.start_date, task.end_date)} resize-x">
    <!-- grab handle -->
    <div on:mousedown="{function(event) { startResize('left', task.id, event); }}" role="button" tabindex="0" class="absolute grab-handle top-0 left-0 w-2 h-full cursor-col-resize"></div>
    <div class="p-2 bg-purple-400 rounded cursor-pointer border border-1 border-solid border-purple-200 max-h-10 overflow-hidden text-ellipsis text-xs hover:shadow-lg">
        <span class="text-white font-bold">
            { task.name }
        </span>
        <!-- Estimated minutes -->
        <span class="text-white text-[10px] absolute right-2 bottom-1">
            { estimatedMinutes() }
        </span>
    </div>
    <div on:mousedown="{function(event) { startResize('right', task.id, event); }}" role="button" tabindex="0" class="absolute grab-handle top-0 right-0 w-2 h-full cursor-col-resize"></div>
</div>
