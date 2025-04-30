# MCBE-Database 1.0
A simple Key-Value database system for Minecraft Bedrock Edition Script API that works with dynamic properties. This database uses memory to store data that is usually accessed.

## 🔌Installation
1. Download `Database.ts`, `Database.d.ts`, `database_config.ts`. You can find these at the [Releases](https://github.com/xigma0512/MCBE-DataBase/releases) page.
- `Database.ts`: main file of the database.
- `database_config.ts`: you can modify settings here.
- `Database.d.ts`(optional): declaration file for `Database.ts`. Download it if you need type hints.

    > If you are using JavaScript instead of TypeScript, just download the corresponding `.js` files (e.g., `Database.js`, `database_config.js`). It should work fine.

2. Put them into your project's behavior pack script folder (e.g., `your_project/src/mcbe-database/`)

## ⚡Usage

### Create a new database
> [!IMPORTANT]  
> After version v1.0.1, you can now store object (JSON) type values in the database, but data like Class instances or Map may not be stored successfully.
```typescript
import { DatabaseManager } from "./Database.ts"

/* 'T' can be any, number, boolean, string, Vector3, undefined or Object(e,g., Record) */
const database = DatabaseManager.instance.getDatabase<T>("my-database");
```

### DatabaseManager Methods
```typescript
/* save all change of each database */
DatabaseManger.instance.saveAllDatabase();

/* Show all elements in the database to player */
DatabaseManger.instance.printElements('my-database', player);
```

### Database Methods
```typescript
/* Save all elements in the database */
database.save();

/* Gets a value from the database by key. */
const value = database.get('foo') as T;
/* Gets all elements as Record<string, T> */
const all = database.getAll() as Record<string, T>;
/* Gets an array of all keys */
const keys = database.keys() as string[];
/* Gets an array of all values */
const values = database.values() as string[];
/* Gets number of elements in database */
const size = database.size() as number;

/* Sets or updates data with key 'foo' with value 'bar' */
database.set('foo', 'bar');

/* Delete element with key 'foo' */
database.delete('foo'); // return boolean
/* Clear all elements in the database */
database.clear();
```

### Cache Cleaner
If you want the system to release cache (database instance) regularly to free up memory for databases that are no longer actively being used, you have to modify `database_config.ts`.
```typescript
export const CACHE_RELEASE = {
    // Set to true to enable automatic cache release.  
    ENABLE: true,
    // The interval (in seconds) at which the cleaner releases cache.
    EXECUTION_INTERVAL: 180
};
```

## 🔥Contribution
Contributions are welcome and greatly appreciated. Here are some ways you can contribute:

1. **Reporting Issues** \
If you find any bugs or have suggestions for new features, please open an issue on the GitHub repository.
2. **Submitting Pull Requests**
* Fork the repository.
* Create a new branch for your feature or bug fix (git checkout -b feature/your-feature-name or fix/your-bug-fix).
* Make your changes and commit them with clear and concise messages.
* Push your changes to your fork (git push origin feature/your-feature-name).   
* Open a pull request to the main repository's main branch.
* Please ensure your code follows the existing coding style and includes appropriate documentation and tests if applicable.
3. **Improving Documentation** \
If you find any parts of the README or other documentation unclear or incomplete, feel free to suggest improvements or submit pull requests to enhance them.

> Before contributing, please take a moment to review the existing issues and pull requests to avoid duplicating effort.
> Thank you for helping to improve MCBE-Database!

## 💬Contact
If you have any questions or suggestions, feel free to reach out:

* **Open an Issue**
* **Discord:** @xigma0512

## 🔒License
Distributed under the MIT License. See LICENSE for more information.