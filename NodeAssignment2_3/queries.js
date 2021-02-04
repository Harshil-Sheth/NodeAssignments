const Pool = require('pg').Pool
const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'Cars',
  password: 'password',
  port: 5432,
})


const getCars = (request, response) => {
  pool.query('SELECT car.id as Id, car."name" as "Name", model."name" as "Model Name", make."name" as "Make Name",array_agg(carimage.imgpath) AS Images FROM car INNER JOIN model ON car.modelid = model.id INNER JOIN make ON car.makeid = make.id INNER JOIN carimage ON car.id = carimage.carid GROUP BY car.id, "Name", "Model Name", "Make Name" ORDER BY car.id', (error, results) => {
    if (error) {
      throw error
    }
    response.status(200).json(results.rows)
  })
}


const getCarById = (request, response) => {
  const id = parseInt(request.params.id)

  pool.query(
    'SELECT car.id as Id, car."name" as "Name", model."name" as "Model Name", make."name" as "Make Name",array_agg(carimage.imgpath) AS Images FROM car INNER JOIN model ON car.modelid = model.id INNER JOIN make ON car.makeid = make.id INNER JOIN carimage ON car.id = carimage.carid GROUP BY car.id, "Name", "Model Name", "Make Name" HAVING car.id = $1', [id], (error, results) => {
    if (error) {
      throw error
    }
    response.status(200).json(results.rows)
  })
}

const uploadImage = (carid, imgpath, createdDate, res) => {
  pool.query(
    "INSERT INTO carimage (imgpath, carid, createdDate) VALUES ($1, $2, $3)",
    [imgpath, carid, createdDate],
    (error, results) => {
      if (error) throw error;
      res.status(201).send(`Image ${carid} uploaded successfully.`);
    }
  );
};

// const createCar = async (request, response) => {  
//   let carName  = request.body.carName;
//   let makeName = request.body.makeName;
//   let modelName = request.body.modelName;
//   let makeId;
//   let modelId;

//   const ifCarExists = await pool.query('SELECT name from car where name = $1',[carName]);
//   // (error,results)=>{
//   //   if(error){
//   //     throw error;
//   //   }
//   //   else{
//   //     if(results.rowCount>=1){
//   //       response.send("Car Already Exist!!");
//   //     }
//   //   }
//   // })
//   const ifMakeExists = await pool.query("select id, name from make where name=$1",[makeName]);
//   // ,(error,results)=>{  
//   //   if(error){
//   //     throw error;
//   //   }
//   //   else{
//   //     if(results.rowCount>=1){
//   //       response.send("Make Already Exist!!");
//   //     }
//   //   }
//   // })
//   const ifModelExists = await pool.query("select id, name from model where name=$1",[modelName]);
//   // ,(error,results)=>{  
//   //   if(error){
//   //     throw error;
//   //   }
//   //   else{
//   //     if(results.rowCount>=1){
//   //       response.send("Model Already Exist!!");
//   //     }
//   //   }
//   // })

//   if(ifCarExists.rowCount>=1){
//     response.send("Car Already Exist!!");
//   }
//   else if(ifMakeExists.rowCount>=1){
//     response.send("Make Already Exist!!");
//   }
//   else if(ifModelExists.rowCount>=1){
//     response.send("Model Already Exist!!");
//   }

//   else{
//     const result1 = await pool.query(
//       "INSERT INTO make (name) VALUES ($1)",
//       [modelName]
//     );
//     makeId = result1.rows[0].id;

//     const result2 = await pool.query(
//       "INSERT INTO model (name) VALUES ($1)",
//       [modelName]
//     );
//     modelId = result2.rows[0].id;

  
//     if (makeId != null && modelId != null){ pool.query('INSERT INTO car (name, makeid, modelid) VALUES ($1, $2, $3)', [carName, makeId, modelId], (error, results) => {
//   if (error) {
//         throw error
//       }
//       response.status(201).send(`Car added successfully`)
//   })
// }
// }

// }
const createCar = async (request, response) => {
  const carName = request.body.carName;
  const makeName = request.body.makeName;
  const modelName = request.body.modelName;
  let modelId;
  let makeId;

  const ifCarExists = await pool.query(
    "SELECT name from car where name = $1",
    [carName]
  );

  const ifMakeExists = await pool.query(
    "SELECT id, name FROM make where name = $1",
    [makeName]
  );

  const ifModelExists = await pool.query(
    "SELECT id, name FROM model where name = $1",
    [modelName]
  );

  if (ifCarExists.rowCount >= 1) {
    response.status(409).send(`Car already exists.`);
  }

  else if (ifMakeExists.rowCount >= 1) {
    response.status(409).send(`Make already exists.`);
  }

  else if (ifModelExists.rowCount >= 1) {
    response.status(409).send(`Model already exists.`);
  }

  else {
    const result1 = await pool.query(
      "INSERT INTO make (name) VALUES ($1) RETURNING id",
      [modelName]
    );
    makeId = result1.rows[0].id;

    const result2 = await pool.query(
      "INSERT INTO model (name) VALUES ($1) RETURNING id",
      [modelName]
    );
    modelId = result2.rows[0].id;

    if (makeId != null && modelId != null) {
      pool.query(
        "INSERT INTO car (name, makeid, modelid) VALUES ($1, $2, $3) RETURNING id",
        [carName, makeId, modelId],
        (error, results) => {
          if (error) {
            throw error;
          }
          response.status(201).send(`Car ${carName} added successfully.`);
        }
      );
    }
  }
};


// const updateCar = async (request, response) => {
//   const carName = request.body.carName;
//   const makeName = request.body.makeName;
//   const modelName = request.body.modelName;
//   let carId = parseInt(request.params.id);
//   let modelId;
//   let makeId;


//   const ifCarExists = await pool.query('SELECT * from car where id = $1',[carId]);
//   if (ifCarExists.rowCount > 0) {
//     let compare = carName.localeCompare(ifCarExists.rows[0].name.toString());
//     if (compare == 0) {
//       const oldMakeId = await pool.query("SELECT id FROM make WHERE name = $1",[makeName]);
//       const oldModelId = await pool.query("SELECT id FROM model WHERE name = $1",[modelName]);
//       if (oldMakeId.rowCount == 0 && oldModelId.rowCount > 0) {
//         const newMakeId = await pool.query("INSERT INTO make (name) VALUES ($1) RETURNING id",[makeName]);
//         makeId = newMakeId.rows[0].id;
//         modelId = oldModelId.rows[0].id;
//       } else if (oldMakeId.rowCount > 0 && oldModelId.rowCount == 0) {
//         makeId = oldMakeId.rows[0].id;
//         const newModelId = await pool.query("INSERT INTO model (name) VALUES ($1) RETURNING id",[modelName]);
//         modelId = newModelId.rows[0].id;
//       } else {
//         const newMakeId = await pool.query(
//           "INSERT INTO make (name) VALUES ($1) RETURNING id",
//           [makeName]
//         );
//         const newModelId = await pool.query(
//           "INSERT INTO model (name) VALUES ($1) RETURNING id",
//           [modelName]
//         );
//         makeId = newMakeId.rows[0].id;
//         modelId = newModelId.rows[0].id;
//       }
//       if (makeId != null && modelId != null) {
//         const query3 = await pool.query(
//           "UPDATE car SET makeid = $1, modelid = $2 where id = $3 RETURNING id",
//           [makeId, modelId, carId]
//         );
//         const updatedId = query3.rows[0].id;
//         response
//           .status(200)
//           .send(`Car ${updatedId} is available and updated successfully.`);
//       }
//     }
//     else if (compare != 0) {
//       response
//         .status(200)
//         .send(
//           `Car not found and go to http://localhost:3000/car and post new car`
//         );
//     }
//   }
//   else {
//     response
//       .status(200)
//       .send(
//         `Car not found and go to http://localhost:3000/car and post new car`
//       );
//   }
// };

//   pool.query(
//     'UPDATE car SET name = $1, makeid = $2, modelid = $3 WHERE id = $4',
//     [name, makeid, modelid, id],
//     (error, results) => {
//       if (error) {          
//         throw error
//       }
//       response.status(200).send(`User modified with ID: ${id}`)
//     }
//   )
// }

const updateCar = async (request, response) => {
  const carName = request.body.carName;
  const makeName = request.body.makeName;
  const modelName = request.body.modelName;
  let carId = parseInt(request.params.id);
  let modelId;
  let makeId;
  const ifCarExists = await pool.query("SELECT * from car where id = $1", [
    carId,
  ]);
  if (ifCarExists.rowCount > 0) {
    let compare = carName.localeCompare(ifCarExists.rows[0].name.toString());
    if (compare == 0) {
      const oldMakeId = await pool.query(
        "SELECT id FROM make WHERE name = $1",
        [makeName]
      );
      const oldModelId = await pool.query(
        "SELECT id FROM model WHERE name = $1",
        [modelName]
      );
      if (oldMakeId.rowCount == 0 && oldModelId.rowCount > 0) {
        const newMakeId = await pool.query(
          "INSERT INTO make (name) VALUES ($1) RETURNING id",
          [makeName]
        );
        makeId = newMakeId.rows[0].id;
        modelId = oldModelId.rows[0].id;
      } else if (oldMakeId.rowCount > 0 && oldModelId.rowCount == 0) {
        makeId = oldMakeId.rows[0].id;
        const newModelId = await pool.query(
          "INSERT INTO model (name) VALUES ($1) RETURNING id",
          [modelName]
        );
        modelId = newModelId.rows[0].id;
      } else {
        const newMakeId = await pool.query(
          "INSERT INTO make (name) VALUES ($1) RETURNING id",
          [makeName]
        );
        const newModelId = await pool.query(
          "INSERT INTO model (name) VALUES ($1) RETURNING id",
          [modelName]
        );
        makeId = newMakeId.rows[0].id;
        modelId = newModelId.rows[0].id;
      }
      if (makeId != null && modelId != null) {
        const query3 = await pool.query(
          "UPDATE car SET makeid = $1, modelid = $2 where id = $3 RETURNING id",
          [makeId, modelId, carId]
        );
        const updatedId = query3.rows[0].id;
        response
          .status(200)
          .send(`Car ${updatedId} is available and updated successfully.`);
      }
    }
    else if (compare != 0) {
      response
        .status(200)
        .send(
          `Car not found and go to http://localhost:3000/car and post new car`
        );
    }
  }
  else {
    response
      .status(200)
      .send(
        `Car not found and go to http://localhost:3000/car and post new car`
      );
  }
};

const deleteCar = (request, response) => {
  const id = parseInt(request.params.id)

  pool.query('DELETE FROM car WHERE id = $1', [id], (error, results) => {
    if (error) {
      throw error
    }
    response.status(200).send(`User deleted with ID: ${id}`)
  })
}

module.exports = {
  getCars,
  getCarById,
  uploadImage,
  createCar,
  updateCar,
  deleteCar
}