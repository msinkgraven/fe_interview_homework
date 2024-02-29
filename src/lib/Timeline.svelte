<style lang="postcss">
</style>

<main class="h-screen">
    <!-- Head -->
    <!-- Scheduler -->
    <div class="flex overflow-scroll relative pt-6 h-full">
        {#each days as day}
        <!-- For the first day of the month add month -->
        {#if day.getDate() == 1}
        <div class="text-center sticky left-3">
            <span class="bg-white text-xs text-purple-800 font-bold uppercase pr-5 pl-2 absolute top-[-22px]">{getMonthFormat(day)}</span>
        </div>
        {/if}
        <div>
            <div class="min-w-14 flex justify-center select-none { getDayFormat(day)[0] == 'S' ? 'bg-slate-100 text-gray-400' : '' }">
                <span class="text-sm py-1 px-2 rounded { isToday(day) ? 'bg-orange-500 text-white font-bold' : '' }">{getDayFormat(day)}</span>
            </div>
            <div class="border-r border-t h-full border-slate-200 min-w-12 p-1 flex justify-center select-none  { getDayFormat(day)[0] == 'S' ? 'bg-slate-100' : '' }">
            </div>
        </div>
        {/each}
    </div>

</main>

<script lang="ts">
let currentDay = new Date();

//   since is current date minus 7 days
const since = new Date(new Date().setDate(new Date().getDate() - 100)).toISOString().split('T')[0];
//   until is current date plus 7 days
const until = new Date(new Date().setDate(new Date().getDate() + 100)).toISOString().split('T')[0];

// days
let days = [];

const getDayFormat = (date) => {
    const days = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
    return days[date.getDay()] + ' ' + date.getDate();
};

const getMonthFormat = (date) => {
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    return months[date.getMonth()];
};

const isToday = (date) => {
    const today = new Date();
    return date.getDate() === today.getDate() && date.getMonth() === today.getMonth() && date.getFullYear() === today.getFullYear();
};

// populate the days array with the dates from since to until
for (let i = new Date(since); i <= new Date(until); i.setDate(i.getDate() + 1)) {
    days.push(new Date(i));
}
</script>
