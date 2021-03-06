(function () {
  'use strict';

  angular.module('app.project')
    .controller('project.Configure', ['$rootScope', '$state', '$stateParams', 'notificationService', 'projectService', 'tokenService', function ($rootScope, $state, $stateParams, notificationService, projectService, tokenService) {
      var _projectId = $stateParams.id;
      var _canRedirect = $stateParams.redirect === 'true';

      function canRedirect(data) {
        return _canRedirect && !!data && data.project_id === _projectId;
      }

      function copied() {
        notificationService.success('Copied!');
      }

      function onCopyError() {
        function getCopyTooltip() {
          if (/iPhone|iPad/i.test(navigator.userAgent)) {
            return 'Copy not supported.';
          } else if (/Mac/i.test(navigator.userAgent)) {
            return 'Press ⌘-C to copy.';
          } else {
            return 'Press Ctrl-C to copy.';
          }
        }

        var element = $('input.api-key');
        element.tooltip({ placement: 'bottom', title: getCopyTooltip() });
        element.select();
      }

      function getDefaultApiKey() {
        function onSuccess(response) {
          vm.apiKey = response.data.id;
          return vm.apiKey;
        }

        function onFailure() {
          notificationService.error('An error occurred while getting the API key for your project.');
        }

        return tokenService.getProjectDefault(_projectId).then(onSuccess, onFailure);
      }

      function getProject() {
        function onSuccess(response) {
          vm.project = response.data.plain();
          return vm.project;
        }

        function onFailure() {
          $state.go('app.dashboard');
          notificationService.error('The project "' + _projectId + '" could not be found.');
        }

        return projectService.getById(_projectId, true).then(onSuccess, onFailure);
      }

      function getProjectTypes() {
        return [
          { key: 'Exceptionless', name: 'Console and Service applications', config: 'app.config', platform: '.NET' },
          { key: 'Exceptionless.Portable', name: 'Portable Class Library', platform: '.NET' },
          { key: 'Exceptionless.Mvc', name: 'ASP.NET MVC', config: 'web.config', platform: '.NET' },
          { key: 'Exceptionless.WebApi', name: 'ASP.NET Web API', config: 'web.config', platform: '.NET' },
          { key: 'Exceptionless.Web', name: 'ASP.NET Web Forms', config: 'web.config', platform: '.NET' },
          { key: 'Exceptionless.Windows', name: 'Windows Forms', config: 'app.config', platform: '.NET' },
          { key: 'Exceptionless.Wpf', name: 'Windows Presentation Foundation (WPF)', config: 'app.config', platform: '.NET' },
          { key: 'Exceptionless.Nancy', name: 'Nancy', config: 'app.config', platform: '.NET' },
          { key: 'Exceptionless.JavaScript', name: 'Browser applications', platform: 'JavaScript' },
          { key: 'Exceptionless.Node', name: 'Node.js', platform: 'JavaScript' }
        ];
      }

      function isDotNet() {
       return vm.currentProjectType.platform === '.NET';
      }

      function isJavaScript() {
        return vm.currentProjectType.platform === 'JavaScript';
      }

      function isNode() {
        return vm.currentProjectType.key === 'Exceptionless.Node';
      }

      function navigateToDashboard() {
        $state.go('app.project-dashboard', { projectId: _projectId } );
      }

      var vm = this;
      vm.apiKey = null;
      vm.canRedirect = canRedirect;
      vm.copied = copied;
      vm.currentProjectType = {};
      vm.isDotNet = isDotNet;
      vm.isJavaScript = isJavaScript;
      vm.isNode = isNode;
      vm.navigateToDashboard = navigateToDashboard;
      vm.onCopyError = onCopyError;
      vm.project = {};
      vm.projectTypes = getProjectTypes();

      getDefaultApiKey().then(getProject);
    }]);
}());
