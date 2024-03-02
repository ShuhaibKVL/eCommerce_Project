
document.addEventListener('DOMContentLoaded', function () {
    // Make an AJAX request to fetch chart data from the server
    fetch('/admin/chart-data')
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(chartData => {
            console.log("chart data : ", chartData);

            updateChart(chartData);
        })
        .catch(error => {
            console.error('Error fetching chart data:', error);
        });
});



function updateChart(chartData) {
    const labels = chartData.labels
    const orderCountData = chartData.data.map(data => data.orderCount)
    const totalAmountData = chartData.data.map(data => data.totalAmount)

    const ctz = document.getElementById('myChart');

    new Chart(ctz, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Number of Orders',
                data: orderCountData,
                backgroundColor: 'rgba(255, 255, 255, 0.3)',//background
                borderColor: 'white', // border
                borderWidth: 1,
                yAxisID: 'y-axis-order'
            },
            {
                label: 'Total Amount',
                data: totalAmountData,
                backgroundColor: 'rgba(255, 165, 0, 0.3)', // Blue background
                borderColor: 'orange', //border
                borderWidth: 1,
                yAxisID: 'y-axis-amount'
            }]
        },
        options: {
            scales: {
                yAxes: [{
                    id: 'y-axis-order',
                    type: 'linear',
                    position: 'left',
                    ticks: {
                        beginAtZero: true,
                        fontColor: 'white', //order count
                    },
                    scaleLabel: {
                        display: true,
                        labelString: 'Number of Orders',
                        fontColor: 'green' //order count label
                    }
                },
                {
                    id: 'y-axis-amount',
                    type: 'linear',
                    position: 'right',
                    ticks: {
                        beginAtZero: true,
                        fontColor: 'orange' //total amount
                    },
                    scaleLabel: {
                        display: true,
                        labelString: 'Total Amount',
                        fontColor: 'white' //total amount label
                    }
                }],
                xAxes: [{
                    ticks: {
                        fontColor: 'white' //  x-axis labels
                    }
                }]
            },
            plugins: {
                legend: {
                    labels: {
                        fontColor: 'white' //color for legend
                    }
                }
            }
        }
    });

    //---------------------------------------------------//
    const latestProducts = document.getElementById('categoryDescription')
    const productsHTML = chartData.categoryLabels.map((categoryLabels,index) => `
                                <tr>
                                    <td><i class="fa fa-circle text-white mr-2"></i>${categoryLabels}</td>
                                    <td>${chartData.categoryData[index]}</td>
                                </tr>
                        `).join('');

    latestProducts.innerHTML = productsHTML
    

    const ctx = document.getElementById('categoryChart').getContext('2d');

    const data = {
        labels: chartData.categoryLabels,
        datasets: [{
            data: chartData.categoryData,
            backgroundColor: [
                'rgba(255, 255, 255, 0.4)', // White with 40% opacity
                'rgba(255, 165, 0, 0.4)',    // Orange with 40% opacity
                'rgba(0, 0, 255, 0.4)',     // Blue with 40% opacity
                'rgba(0, 128, 0, 0.4)'      // Green with 40% opacity
            ],
            borderWidth: 1
        }]
    };
    
    const options = {
        scales: {
            yAxes: [{
                display: false
            }],
            xAxes: [{
                display: false
            }],
        },
        // legend: {
        //     labels: {
        //         fontColor: 'white', // Set label color to white
        //         fontSize:'5px'
        //     }
        // }
    };
    
    new Chart(ctx, {
        type: 'pie',
        data: data,
        options: options
    });

}

document.addEventListener('DOMContentLoaded', function() {

  const dayButton = document.getElementById('day')
  const weekButton= document.getElementById('week')
  const monthButton = document.getElementById('month')

  dayButton.addEventListener('click', function () {
    fetchData('day');
    });

  weekButton.addEventListener('click', function () {
    fetchData('week');
  });

  monthButton.addEventListener('click', function () {
    fetchData('month');
  })

  function fetchData(time){
    fetch(`/admin/filter-chart?timeChart=${time}`)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then(chartData => {
                console.log("chart data: ", chartData);
                updateChart(chartData);
            })
            .catch(error => {
                console.error('Error fetching chart data:', error);
            });
  }

})

