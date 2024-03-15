<?php

namespace APP\plugins\generic\demographicData;

use PKP\plugins\GenericPlugin;
use APP\core\Application;
use Illuminate\Database\Migrations\Migration;
use PKP\plugins\Hook;

class DemographicDataPlugin extends GenericPlugin
{
    public function register($category, $path, $mainContextId = null): bool
    {
        $success = parent::register($category, $path);
        if ($success && $this->getEnabled()) {
            Hook::add('TemplateManager::display', [$this, 'addDemographicDataTab']);
        }
        return $success;
    }

    public function addDemographicDataTab(string $hookName, array $args)
    {
        $templateMgr = $args[0];
        $template = $args[1];
        if ($template === 'user/profile.tpl') {
            $templateMgr->registerFilter('output', [$this, 'demographicDataTabFilter']);
        }
    }

    public function demographicDataTabFilter($output, $templateMgr)
    {
        if (preg_match('/<div[^>]+id="profileTabs"[^>]*>.*?<ul[^>]*>(.*?<\/li>)/s', $output, $matches, PREG_OFFSET_CAPTURE)) {
            $match = $matches[0][0];
            $offset = $matches[0][1];
            $newOutput = substr($output, 0, $offset + strlen($match));
            error_log($newOutput);
            $newOutput .= $templateMgr->fetch($this->getTemplateResource('tab.tpl'));
            $newOutput .= substr($output, $offset + strlen($match));
            $output = $newOutput;
            $templateMgr->unregisterFilter('output', [$this, 'demographicDataTabFilter']);
        }
        return $output;
    }

    public function getDisplayName()
    {
        return __('plugins.generic.demographicData.displayName');
    }

    public function getDescription()
    {
        return __('plugins.generic.demographicData.description');
    }

    public function getInstallMigration(): Migration
    {
        return new DemographicQuestionsSchemaMigration();
    }

    public function getCanEnable()
    {
        $request = Application::get()->getRequest();
        return $request->getContext() !== null;
    }

    public function getCanDisable()
    {
        $request = Application::get()->getRequest();
        return $request->getContext() !== null;
    }
}
