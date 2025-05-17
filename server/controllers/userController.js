
//get /api/user

const getUserData = async(req,res)=>{
    try{
        const role = req.user.role;
        const recentSearchedCities = req.user.recentSearchedCities;
       return res.status(200).json({
         success:true,
            role,
            recentSearchedCities

       })
    } catch(error){
         console.log(error)
        return res.status(500).json({
            success: false,
            message: error.message
        });

    }
}

//store user recent Searched cities
const storeRecentSearchedCities = async(req,res)=>{
    try{
        const {recentSearchedCity} = req.body;
        const user = await req.user;
        if(user.recentSearchedCities.length < 3){
            user.recentSearchedCities.push(recentSearchedCity)
        }else{
            user.recentSearchedCities.shift();
            user.recentSearchedCities.push(recentSearchedCity)
        }
        await user.save()
        return res.status(200).json({
            success:true,
            message:"City Added"
        })
    } catch(error){
          console.log(error)
        return res.status(500).json({
            success: false,
            message: error.message
        });


    }
}
module.exports ={getUserData,storeRecentSearchedCities}