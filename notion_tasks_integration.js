require('dotenv').config();
const { Client } = require('@notionhq/client');

// Initialize Notion client
const notion = new Client({ auth: process.env.NOTION_TOKEN });
const databaseId = process.env.NOTION_DATABASE_ID;

async function getTodayTasks() {
  const response = await notion.databases.query({
    database_id: databaseId,
    filter: {
      property: 'Label',
      select: {
        equals: 'Today',
      },
    },
  });

  return response.results;
}

async function updateTaskLabel(task) {
  const status = task.properties.Status?.select?.name;
  const label = task.properties.Label?.select?.name;

  if (status === 'Done' && label === 'Today') {
   await notion.pages.update({
      page_id: task.id,
      properties: {
        Label: { select: { name: "Past" } },
        "Date Completed": { date: { start: new Date().toISOString() } },
      },
  });
    console.log(`✅ Moved "${task.properties.Name.title[0]?.plain_text}" to Past`);
  }
}

async function run() {
  const tasks = await getTodayTasks();
  for (const task of tasks) {
    await updateTaskLabel(task);
  }
  console.log(`Processed ${tasks.length} tasks`);
}

run().catch(console.error);
